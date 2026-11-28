/**
 * @fileoverview Last.fm "Now Playing" widget with audio preview playback and
 * real-time Web Audio spectrum visualization.
 */

interface LastFmTrack {
  readonly name: string;
  readonly url: string;
  readonly artist: {
    readonly '#text': string;
  };
  readonly image?: ReadonlyArray<{
    readonly size: string;
    readonly '#text': string;
  }>;
  readonly date?: {
    readonly uts: string;
  };
  readonly '@attr'?: {
    readonly nowplaying?: string;
  };
}

interface LastFmResponse {
  readonly recenttracks?: {
    readonly track?: readonly LastFmTrack[];
  };
}

interface NowPlayingStrings {
  readonly live: string;
  readonly ago: string;
  readonly units: string;
  readonly play: string;
  readonly pause: string;
  readonly broke: string;
}

interface TrackAnalysisData {
  readonly levels: readonly number[];
  readonly beats: readonly number[];
}

type PlayerState = 'idle' | 'loading' | 'playing' | 'paused';

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const AUDIO_ARCHIVE_BASE_URL = 'https://files.tek.rip/Downloads/randomsongslol/';

const TIME_UNIT_DIVISORS: readonly number[] = [60, 60, 24, 7, 4.35, 12];
const FRESHNESS_DECAY_MS_PER_PERCENT = 36_000;

const WAVEFORM_BAR_COUNT = 14;
const IDLE_BAR_HEIGHT = 0.1;
const INITIAL_PEAK_LEVEL = 0.25;
const PEAK_DECAY_PER_FRAME = 0.995;
const MIN_PEAK_FLOOR = 0.15;
const MIN_PLAYING_BAR_HEIGHT = 0.06;
const BEAT_FLASH_DECAY = 0.88;
const PLAYING_EASE_FACTOR = 0.45;
const IDLE_EASE_FACTOR = 0.1;

const FFT_SIZE = 2048;
const FFT_SMOOTHING = 0.55;
const FFT_MAX_DECIBELS = -10;
const LOWEST_FREQUENCY_HZ = 40;
const FREQUENCY_SPAN_RATIO = 400;

/** Formats elapsed time since `timestampMs` using localized short units. */
function formatRelativeAge(
  timestampMs: number,
  strings: NowPlayingStrings,
): string {
  const unitLabels = strings.units.split(' ');
  let value = Math.max(1, (Date.now() - timestampMs) / 1000);
  let unitIndex = 0;

  while (
    unitIndex < TIME_UNIT_DIVISORS.length &&
    value >= (TIME_UNIT_DIVISORS[unitIndex] ?? Infinity)
  ) {
    value /= TIME_UNIT_DIVISORS[unitIndex] ?? 1;
    unitIndex += 1;
  }

  const unit = unitLabels[unitIndex] ?? '';
  return strings.ago
    .replace('{n}', String(Math.round(value)))
    .replace('{unit}', unit);
}

/** Formats seconds as `m:ss`. */
function formatClockTime(seconds: number): string {
  const wholeMinutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds % 60);
  return `${wholeMinutes}:${String(wholeSeconds).padStart(2, '0')}`;
}

/** Checks whether a matching MP3 preview exists in the static audio archive. */
async function findAudioPreviewUrl(
  trackName: string,
  artistName: string,
): Promise<string | undefined> {
  const sanitizedFilename =
    `${artistName} - ${trackName}`.replace(/[/\\:*?"<>|]/g, '') + '.mp3';
  const candidateUrl =
    AUDIO_ARCHIVE_BASE_URL + encodeURIComponent(sanitizedFilename);
  const response = await fetch(candidateUrl, {method: 'HEAD'});
  return response.ok ? candidateUrl : undefined;
}

/** Builds a smooth closed SVG path from normalized bar heights in `[0, 1]`. */
function buildWaveformPath(heights: readonly number[]): string {
  const lastIndex = Math.max(1, heights.length - 1);
  const points = heights.map((height, index) => ({
    x: (index / lastIndex) * 100,
    y: 100 - height * 100,
  }));

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  if (!firstPoint || !lastPoint) {
    return '';
  }

  let path = `M0 100 L${firstPoint.x},${firstPoint.y}`;
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    if (!previous || !current) {
      continue;
    }
    const midX = (previous.x + current.x) / 2;
    const midY = (previous.y + current.y) / 2;
    path += ` Q${previous.x} ${previous.y} ${midX} ${midY}`;
  }

  return `${path} L${lastPoint.x},${lastPoint.y} L100 100Z`;
}

/** Computes a sweeping pulse height for idle and loading animations. */
function computeSweepHeight(
  normalizedPosition: number,
  timestampMs: number,
  periodSeconds: number,
): number {
  const rawPhase = (timestampMs / 1000 - normalizedPosition) / periodSeconds;
  const phase = ((rawPhase % 1) + 1) % 1;
  const pulse = Math.max(0, 1 - Math.abs(phase - 0.2) / 0.2);
  return IDLE_BAR_HEIGHT + 0.9 * pulse * pulse;
}

/** Computes logarithmically spaced FFT bin boundaries for `WAVEFORM_BAR_COUNT`. */
function computeFrequencyBinEdges(
  sampleRate: number,
  fftSize: number,
): number[] {
  const hzPerBin = sampleRate / fftSize;
  const firstBin = Math.round(LOWEST_FREQUENCY_HZ / hzPerBin);
  return Array.from({length: WAVEFORM_BAR_COUNT + 1}, (_, index) =>
    Math.round(firstBin * FREQUENCY_SPAN_RATIO ** (index / WAVEFORM_BAR_COUNT)),
  );
}

/** Creates an anchor element safely without using `innerHTML`. */
function createLinkElement(href: string, text: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.textContent = text;
  return anchor;
}

/** Creates the bouncing error banner DOM element. */
function createErrorBanner(message: string): HTMLParagraphElement {
  const paragraph = document.createElement('p');
  paragraph.className = 'error-banner';

  const outerSpan = document.createElement('span');
  const innerSpan = document.createElement('span');
  innerSpan.textContent = message;

  outerSpan.append(innerSpan);
  paragraph.append(outerSpan);
  return paragraph;
}

/** Controller for the audio preview player and animated SVG waveform. */
class WaveformAudioPlayer {
  private readonly container: HTMLElement;
  private readonly playButton: HTMLButtonElement;
  private readonly waveformSvg: SVGSVGElement;
  private readonly waveformPaths: readonly SVGPathElement[];
  private readonly currentTimeLabel: HTMLElement;
  private readonly totalTimeLabel: HTMLElement;
  private readonly audio: HTMLAudioElement;
  private readonly strings: NowPlayingStrings;

  private audioUrl: string | undefined;
  private barHeights: number[] = Array<number>(WAVEFORM_BAR_COUNT).fill(
    IDLE_BAR_HEIGHT,
  );
  private readonly barPeaks: number[] = Array<number>(WAVEFORM_BAR_COUNT).fill(
    INITIAL_PEAK_LEVEL,
  );
  private staticShape: readonly number[] | undefined;
  private analyser: AnalyserNode | undefined;
  private frequencyBins: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private binEdges: number[] = [];
  private beatTimestampsSec: readonly number[] = [];
  private nextBeatIndex = 0;
  private flashIntensity = 0;

  constructor(
    root: HTMLElement,
    audio: HTMLAudioElement,
    strings: NowPlayingStrings,
  ) {
    const container = root.querySelector<HTMLElement>('.audio-player');
    const playButton = container?.querySelector<HTMLButtonElement>('.play-button');
    const waveformSvg = container?.querySelector<SVGSVGElement>('.waveform');
    const timeLabels = container?.querySelectorAll<HTMLElement>(
      '.track-time span',
    );
    const currentTimeLabel = timeLabels?.[0];
    const totalTimeLabel = timeLabels?.[1];

    if (
      !container ||
      !playButton ||
      !waveformSvg ||
      !currentTimeLabel ||
      !totalTimeLabel
    ) {
      throw new Error('Now Playing player markup is incomplete.');
    }

    this.container = container;
    this.playButton = playButton;
    this.waveformSvg = waveformSvg;
    this.waveformPaths = [...waveformSvg.querySelectorAll('path')];
    this.currentTimeLabel = currentTimeLabel;
    this.totalTimeLabel = totalTimeLabel;
    this.audio = audio;
    this.strings = strings;

    this.bindEvents();
    window.requestAnimationFrame((timestamp) => {
      this.renderFrame(timestamp);
    });
  }

  /** Loads a new preview URL (or clears playback if `foundUrl` is undefined). */
  loadTrack(foundUrl?: string): void {
    this.pause();
    this.setState('idle');
    this.audioUrl = foundUrl;
    this.staticShape = undefined;
    this.beatTimestampsSec = [];
    this.nextBeatIndex = 0;

    this.waveformSvg.style.setProperty('--progress', '0');
    this.currentTimeLabel.textContent = formatClockTime(0);
    this.totalTimeLabel.textContent = formatClockTime(0);
    this.playButton.disabled = !foundUrl;

    if (!foundUrl) {
      this.audio.removeAttribute('src');
      return;
    }

    this.audio.src = foundUrl;
    const analysisUrl = foundUrl.replace(/mp3$/, 'json');
    fetch(analysisUrl)
      .then((response) => response.json() as Promise<TrackAnalysisData>)
      .then((analysis) => {
        this.staticShape = analysis.levels;
        this.beatTimestampsSec = analysis.beats;
      })
      .catch(() => {
        // Precomputed waveform/beat metadata is optional.
      });
  }

  private getState(): PlayerState {
    return (this.container.dataset.state as PlayerState | undefined) ?? 'idle';
  }

  private setState(state: PlayerState): void {
    this.container.dataset.state = state;
  }

  private pause(): void {
    this.audio.pause();
    this.setState('paused');
    this.playButton.setAttribute('aria-label', this.strings.play);
  }

  private ensureAnalyser(): void {
    if (this.analyser) {
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = FFT_SMOOTHING;
    analyser.maxDecibels = FFT_MAX_DECIBELS;

    this.analyser = analyser;
    this.frequencyBins = new Uint8Array(analyser.frequencyBinCount);
    this.binEdges = computeFrequencyBinEdges(
      audioContext.sampleRate,
      analyser.fftSize,
    );

    const mediaSource = audioContext.createMediaElementSource(this.audio);
    mediaSource.connect(analyser);
    analyser.connect(audioContext.destination);
  }

  private computeTargetBarHeight(barIndex: number, timestampMs: number): number {
    const state = this.getState();

    if (state === 'playing') {
      const startBin = this.binEdges[barIndex] ?? 0;
      const endBin = this.binEdges[barIndex + 1] ?? startBin + 1;
      let binSum = 0;
      for (let bin = startBin; bin < endBin; bin += 1) {
        binSum += this.frequencyBins[bin] ?? 0;
      }

      const average = binSum / Math.max(1, endBin - startBin) / 255;
      const decayedPeak =
        (this.barPeaks[barIndex] ?? INITIAL_PEAK_LEVEL) * PEAK_DECAY_PER_FRAME;
      const peak = Math.max(average, decayedPeak, MIN_PEAK_FLOOR);
      this.barPeaks[barIndex] = peak;

      const normalized = average / peak;
      return Math.max(MIN_PLAYING_BAR_HEIGHT, normalized * normalized);
    }

    if (state !== 'loading' && this.staticShape) {
      return this.staticShape[barIndex] ?? IDLE_BAR_HEIGHT;
    }

    const periodSeconds = state === 'loading' ? 1.2 : 2.4;
    return computeSweepHeight(
      barIndex / WAVEFORM_BAR_COUNT,
      timestampMs,
      periodSeconds,
    );
  }

  private renderFrame(timestampMs: number): void {
    const isPlaying = this.getState() === 'playing';
    if (this.analyser && isPlaying) {
      this.analyser.getByteFrequencyData(this.frequencyBins);
    }

    while (
      this.nextBeatIndex < this.beatTimestampsSec.length &&
      (this.beatTimestampsSec[this.nextBeatIndex] ?? Infinity) <=
        this.audio.currentTime
    ) {
      this.flashIntensity = 1;
      this.nextBeatIndex += 1;
    }

    this.flashIntensity *= BEAT_FLASH_DECAY;
    this.waveformSvg.style.setProperty(
      '--flash',
      this.flashIntensity.toFixed(2),
    );

    const easeFactor = isPlaying ? PLAYING_EASE_FACTOR : IDLE_EASE_FACTOR;
    this.barHeights = this.barHeights.map((current, index) => {
      const target = this.computeTargetBarHeight(index, timestampMs);
      return current + (target - current) * easeFactor;
    });

    const pathData = buildWaveformPath(this.barHeights);
    for (const pathElement of this.waveformPaths) {
      pathElement.setAttribute('d', pathData);
    }

    if (this.audio.duration) {
      const progress = this.audio.currentTime / this.audio.duration;
      this.waveformSvg.style.setProperty('--progress', String(progress));
      this.currentTimeLabel.textContent = formatClockTime(
        this.audio.currentTime,
      );
      this.totalTimeLabel.textContent = formatClockTime(this.audio.duration);
    }

    window.requestAnimationFrame((nextTimestamp) => {
      this.renderFrame(nextTimestamp);
    });
  }

  private getPointerProgress(event: MouseEvent): number {
    const {left, width} = this.waveformSvg.getBoundingClientRect();
    if (width <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, (event.clientX - left) / width));
  }

  private bindEvents(): void {
    this.playButton.addEventListener('click', () => {
      if (!this.audioUrl) {
        return;
      }
      if (!this.audio.paused || this.getState() === 'loading') {
        this.pause();
        return;
      }

      this.playButton.setAttribute('aria-label', this.strings.pause);
      this.ensureAnalyser();
      this.setState('loading');
      this.audio.play().catch(() => {
        this.pause();
      });
    });

    this.audio.addEventListener('playing', () => {
      this.setState('playing');
    });

    this.audio.addEventListener('ended', () => {
      this.pause();
    });

    this.audio.addEventListener('seeked', () => {
      const nextIndex = this.beatTimestampsSec.findIndex(
        (beatSec) => beatSec > this.audio.currentTime,
      );
      this.nextBeatIndex =
        nextIndex < 0 ? this.beatTimestampsSec.length : nextIndex;
    });

    this.waveformSvg.addEventListener('pointermove', (event: PointerEvent) => {
      this.waveformSvg.style.setProperty(
        '--hover',
        String(this.getPointerProgress(event)),
      );
    });

    this.waveformSvg.addEventListener('click', (event: MouseEvent) => {
      if (this.audio.duration) {
        this.audio.currentTime =
          this.getPointerProgress(event) * this.audio.duration;
      }
    });
  }
}

/** Returns the Unix timestamp in milliseconds for a Last.fm track. */
function getTrackTimestampMs(track: LastFmTrack): number {
  return track.date ? Number(track.date.uts) * 1000 : Date.now();
}

/** Returns a CSS color that fades from green (live) to dim over ~1 hour. */
function getTrackFreshnessColor(track: LastFmTrack): string {
  const ageMs = Date.now() - getTrackTimestampMs(track);
  const freshnessPercent = Math.max(
    0,
    100 - ageMs / FRESHNESS_DECAY_MS_PER_PERCENT,
  );
  return `color-mix(in oklab, var(--green) ${freshnessPercent}%, var(--dim))`;
}

/** Fetches recent Last.fm tracks and hydrates a `.now-playing` widget root. */
async function hydrateNowPlayingWidget(root: HTMLElement): Promise<void> {
  const user = root.dataset.user;
  const apiKey = root.dataset.key;
  const rawStrings = root.dataset.strings;
  if (!user || !apiKey || !rawStrings) {
    return;
  }

  const strings = JSON.parse(rawStrings) as NowPlayingStrings;
  const trackElement = root.querySelector<HTMLElement>('.track-title');
  const artistElement = root.querySelector<HTMLElement>('.track-artist');
  const coverLink = root.querySelector<HTMLAnchorElement>('.album-art');
  const parent = root.parentElement;
  const recentList = parent?.querySelector<HTMLUListElement>('.recent-tracks');
  const audioElement = parent?.querySelector<HTMLAudioElement>('.track-audio');

  if (
    !trackElement ||
    !artistElement ||
    !coverLink ||
    !recentList ||
    !audioElement
  ) {
    return;
  }

  const query = new URLSearchParams({
    method: 'user.getrecenttracks',
    user,
    api_key: apiKey,
    format: 'json',
    limit: '10',
  });

  try {
    const response = await fetch(`${LASTFM_API_URL}?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = (await response.json()) as LastFmResponse;
    const tracks = payload.recenttracks?.track ?? [];
    const latestTrack = tracks[0];
    if (!latestTrack) {
      throw new Error('No recent tracks returned.');
    }

    const audioPlayer = new WaveformAudioPlayer(root, audioElement, strings);

    const displayTrack = (selected: LastFmTrack): void => {
      trackElement.replaceChildren(
        createLinkElement(selected.url, selected.name),
      );
      trackElement.title = selected.name;
      artistElement.textContent = selected.artist['#text'];

      const coverUrl = selected.image?.find(
        (image) => image.size === 'extralarge',
      )?.['#text'];
      coverLink.style.backgroundImage = coverUrl ? `url("${coverUrl}")` : '';
      coverLink.href = selected.url;

      findAudioPreviewUrl(selected.name, selected.artist['#text']).then(
        (previewUrl) => {
          audioPlayer.loadTrack(previewUrl);
        },
        () => {
          audioPlayer.loadTrack(undefined);
        },
      );

      const listItems = tracks.map((track) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${track.name} - ${track.artist['#text']}`;
        button.classList.toggle('is-selected', track === selected);

        const ageSpan = document.createElement('span');
        const ageText = track.date
          ? formatRelativeAge(getTrackTimestampMs(track), strings)
          : strings.live;
        ageSpan.textContent = ` ${ageText}`;
        ageSpan.style.color = getTrackFreshnessColor(track);
        button.append(ageSpan);

        button.addEventListener('click', () => {
          window.setTimeout(() => {
            displayTrack(track);
          });
        });

        const item = document.createElement('li');
        item.append(button);
        return item;
      });

      recentList.replaceChildren(...listItems);
    };

    displayTrack(latestTrack);
  } catch {
    recentList.previousElementSibling?.remove();
    recentList.replaceChildren();
    root.replaceChildren(createErrorBanner(strings.broke));
  }
}

/** Initializes all `.now-playing` widgets on the page. */
export function initNowPlayingWidgets(): void {
  const widgets = document.querySelectorAll<HTMLElement>('.now-playing');
  for (const widget of widgets) {
    void hydrateNowPlayingWidget(widget);
  }
}
