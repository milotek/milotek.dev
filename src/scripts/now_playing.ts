/**
 * @fileoverview Last.fm "Now Playing" widget with audio preview playback and
 * real-time Web Audio spectrum visualization.
 */

interface LastFmTrack {
  readonly name: string;
  readonly url: string;
  readonly artist: {readonly '#text': string};
  readonly image?: ReadonlyArray<{readonly size: string; readonly '#text': string}>;
  readonly date?: {readonly uts: string};
}

interface NowPlayingStrings {
  readonly live: string;
  readonly ago: string;
  readonly units: string;
  readonly play: string;
  readonly pause: string;
  readonly broke: string;
}

interface TrackAnalysis {
  readonly levels: readonly number[];
  readonly beats: readonly number[];
}

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const AUDIO_ARCHIVE_URL = 'https://files.tek.rip/Downloads/randomsongslol/';

const TIME_DIVISORS: readonly number[] = [60, 60, 24, 7, 4.35, 12];
const FRESHNESS_MS_PER_PERCENT = 36_000;
const WAVEFORM_BARS = 14;
const FFT_SIZE = 2048;
const LASTFM_DEFAULT_COVER_ID = '2a96cbd8b46e442fc41c2b86b821562f';

/** Formats elapsed time since `timestampMs` using localized short units. */
function formatRelativeAge(timestampMs: number, strings: NowPlayingStrings): string {
  const units = strings.units.split(' ');
  let value = Math.max(1, (Date.now() - timestampMs) / 1000);
  let index = 0;

  while (index < TIME_DIVISORS.length && value >= (TIME_DIVISORS[index] ?? Infinity)) {
    value /= TIME_DIVISORS[index] ?? 1;
    index += 1;
  }

  return strings.ago
    .replace('{n}', String(Math.round(value)))
    .replace('{unit}', units[index] ?? '');
}

/** Formats seconds as `m:ss`. */
function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/** Checks whether a matching MP3 preview exists in the static audio archive. */
async function findPreviewUrl(
  trackName: string,
  artistName: string,
): Promise<string | undefined> {
  const filename = `${artistName} - ${trackName}`.replace(/[/\\:*?"<>|]/g, '') + '.mp3';
  const candidate = AUDIO_ARCHIVE_URL + encodeURIComponent(filename);
  const response = await fetch(candidate, {method: 'HEAD'});
  return response.ok ? candidate : undefined;
}

/** Builds a smooth closed SVG path from normalized bar heights in `[0, 1]`. */
function buildWaveformPath(heights: readonly number[]): string {
  const span = Math.max(1, heights.length - 1);
  let prevX = 0;
  let prevY = 100 - (heights[0] ?? 0) * 100;
  let path = `M0 100 L${prevX},${prevY}`;

  for (let i = 1; i < heights.length; i += 1) {
    const x = (i / span) * 100;
    const y = 100 - (heights[i] ?? 0) * 100;
    path += ` Q${prevX} ${prevY} ${(prevX + x) / 2} ${(prevY + y) / 2}`;
    prevX = x;
    prevY = y;
  }

  return `${path} L${prevX},${prevY} L100 100Z`;
}

/** Computes a sweeping pulse height for idle and loading animations. */
function computeSweepHeight(position: number, nowMs: number, periodSec: number): number {
  const phase = ((((nowMs / 1000 - position) / periodSec) % 1) + 1) % 1;
  const pulse = Math.max(0, 1 - Math.abs(phase - 0.2) / 0.2);
  return 0.1 + 0.9 * pulse * pulse;
}

/** Creates the bouncing error banner DOM element without using `innerHTML`. */
function createErrorBanner(message: string): HTMLParagraphElement {
  const banner = document.createElement('p');
  banner.className = 'error-banner';
  const outer = document.createElement('span');
  const inner = document.createElement('span');
  inner.textContent = message;
  outer.append(inner);
  banner.append(outer);
  return banner;
}

/** Attaches preview playback and live FFT waveform rendering to a widget. */
function createWaveformPlayer(
  root: HTMLElement,
  audio: HTMLAudioElement,
  strings: NowPlayingStrings,
): (previewUrl?: string) => void {
  const container = root.querySelector<HTMLElement>('.audio-player');
  const playButton = container?.querySelector<HTMLButtonElement>('.play-button');
  const waveform = container?.querySelector<SVGSVGElement>('.waveform');
  const [currentTimeEl, totalTimeEl] =
    container?.querySelectorAll<HTMLElement>('.track-time span') ?? [];

  if (!container || !playButton || !waveform || !currentTimeEl || !totalTimeEl) {
    return () => {};
  }

  const paths = [...waveform.querySelectorAll('path')];
  let previewUrl: string | undefined;
  let heights = Array<number>(WAVEFORM_BARS).fill(0.1);
  const peaks = Array<number>(WAVEFORM_BARS).fill(0.25);
  let staticShape: readonly number[] | undefined;
  let beats: readonly number[] = [];
  let nextBeatIndex = 0;
  let flash = 0;

  let analyser: AnalyserNode | undefined;
  let bins: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  let binEdges: number[] = [];

  const pause = (): void => {
    audio.pause();
    container.dataset.state = 'paused';
    playButton.setAttribute('aria-label', strings.play);
  };

  const getPointerRatio = (event: MouseEvent): number => {
    const {left, width} = waveform.getBoundingClientRect();
    return width > 0 ? Math.min(1, Math.max(0, (event.clientX - left) / width)) : 0;
  };

  const computeTargetHeight = (barIndex: number, nowMs: number): number => {
    const state = container.dataset.state;
    if (state === 'playing') {
      const start = binEdges[barIndex] ?? 0;
      const end = binEdges[barIndex + 1] ?? start + 1;
      let sum = 0;
      for (let bin = start; bin < end; bin += 1) {
        sum += bins[bin] ?? 0;
      }
      const average = sum / Math.max(1, end - start) / 255;
      const peak = Math.max(average, (peaks[barIndex] ?? 0.25) * 0.995, 0.15);
      peaks[barIndex] = peak;
      return Math.max(0.06, (average / peak) ** 2);
    }
    if (state !== 'loading' && staticShape) {
      return staticShape[barIndex] ?? 0.1;
    }
    return computeSweepHeight(barIndex / WAVEFORM_BARS, nowMs, state === 'loading' ? 1.2 : 2.4);
  };

  const renderFrame = (nowMs: number): void => {
    const isPlaying = container.dataset.state === 'playing';
    if (analyser && isPlaying) {
      analyser.getByteFrequencyData(bins);
    }

    while (
      nextBeatIndex < beats.length &&
      (beats[nextBeatIndex] ?? Infinity) <= audio.currentTime
    ) {
      flash = 1;
      nextBeatIndex += 1;
    }

    flash *= 0.88;
    waveform.style.setProperty('--flash', flash.toFixed(2));

    const ease = isPlaying ? 0.45 : 0.1;
    heights = heights.map((height, i) => height + (computeTargetHeight(i, nowMs) - height) * ease);

    const pathData = buildWaveformPath(heights);
    for (const path of paths) {
      path.setAttribute('d', pathData);
    }

    if (audio.duration) {
      waveform.style.setProperty('--progress', String(audio.currentTime / audio.duration));
      currentTimeEl.textContent = formatClock(audio.currentTime);
      totalTimeEl.textContent = formatClock(audio.duration);
    }

    window.requestAnimationFrame(renderFrame);
  };

  playButton.addEventListener('click', () => {
    if (!previewUrl) {
      return;
    }
    if (!audio.paused || container.dataset.state === 'loading') {
      pause();
      return;
    }

    playButton.setAttribute('aria-label', strings.pause);
    if (!analyser) {
      const ctx = new AudioContext();
      analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.55;
      analyser.maxDecibels = -10;
      bins = new Uint8Array(analyser.frequencyBinCount);
      const firstBin = Math.round(40 / (ctx.sampleRate / analyser.fftSize));
      binEdges = Array.from({length: WAVEFORM_BARS + 1}, (_, i) =>
        Math.round(firstBin * 400 ** (i / WAVEFORM_BARS)),
      );
      ctx.createMediaElementSource(audio).connect(analyser);
      analyser.connect(ctx.destination);
    }

    container.dataset.state = 'loading';
    audio.play().catch(pause);
  });

  audio.addEventListener('playing', () => {
    container.dataset.state = 'playing';
  });
  audio.addEventListener('ended', pause);
  audio.addEventListener('seeked', () => {
    const ahead = beats.findIndex((beatSec) => beatSec > audio.currentTime);
    nextBeatIndex = ahead < 0 ? beats.length : ahead;
  });

  waveform.addEventListener('pointermove', (event: PointerEvent) => {
    waveform.style.setProperty('--hover', String(getPointerRatio(event)));
  });
  waveform.addEventListener('click', (event: MouseEvent) => {
    if (audio.duration) {
      audio.currentTime = getPointerRatio(event) * audio.duration;
    }
  });

  window.requestAnimationFrame(renderFrame);

  return (foundUrl?: string) => {
    pause();
    container.dataset.state = 'idle';
    previewUrl = foundUrl;
    staticShape = undefined;
    beats = [];
    nextBeatIndex = 0;
    waveform.style.setProperty('--progress', '0');
    currentTimeEl.textContent = formatClock(0);
    totalTimeEl.textContent = formatClock(0);
    playButton.disabled = !foundUrl;

    if (!foundUrl) {
      audio.removeAttribute('src');
      return;
    }

    audio.src = foundUrl;
    fetch(foundUrl.replace(/mp3$/, 'json'))
      .then((res) => res.json() as Promise<TrackAnalysis>)
      .then((analysis) => {
        staticShape = analysis.levels;
        beats = analysis.beats;
      })
      .catch(() => {
        // Precomputed waveform and beat metadata are optional.
      });
  };
}

/** Fetches recent Last.fm tracks and hydrates a `.now-playing` widget root. */
async function hydrateWidget(root: HTMLElement): Promise<void> {
  const {user, key: apiKey, strings: rawStrings} = root.dataset;
  if (!user || !apiKey || !rawStrings) {
    return;
  }

  const strings = JSON.parse(rawStrings) as NowPlayingStrings;
  const trackEl = root.querySelector<HTMLElement>('.track-title');
  const artistEl = root.querySelector<HTMLElement>('.track-artist');
  const artLink = root.querySelector<HTMLAnchorElement>('.album-art');
  const recentList = root.parentElement?.querySelector<HTMLUListElement>('.recent-tracks');
  const audioEl = root.parentElement?.querySelector<HTMLAudioElement>('.track-audio');
  if (!trackEl || !artistEl || !artLink || !recentList || !audioEl) {
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

    const payload = (await response.json()) as {
      recenttracks?: {track?: readonly LastFmTrack[]};
    };
    const tracks = payload.recenttracks?.track ?? [];
    const latest = tracks[0];
    if (!latest) {
      throw new Error('No recent tracks returned.');
    }

    const loadPreview = createWaveformPlayer(root, audioEl, strings);

    const showTrack = (selected: LastFmTrack): void => {
      const link = document.createElement('a');
      link.href = selected.url;
      link.textContent = selected.name;
      trackEl.replaceChildren(link);
      trackEl.title = selected.name;
      artistEl.textContent = selected.artist['#text'];

      const rawCover = selected.image?.find((img) => img.size === 'extralarge')?.['#text'];
      const coverUrl =
        rawCover && !rawCover.includes(LASTFM_DEFAULT_COVER_ID) ? rawCover : '';
      artLink.style.backgroundImage = coverUrl ? `url("${coverUrl}")` : '';
      artLink.href = selected.url;

      findPreviewUrl(selected.name, selected.artist['#text']).then(
        (found) => {
          loadPreview(found);
        },
        () => {
          loadPreview(undefined);
        },
      );

      recentList.replaceChildren(
        ...tracks.map((track) => {
          const timestampMs = track.date ? Number(track.date.uts) * 1000 : Date.now();
          const freshness = Math.max(0, 100 - (Date.now() - timestampMs) / FRESHNESS_MS_PER_PERCENT);

          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = `${track.name} - ${track.artist['#text']}`;
          button.classList.toggle('is-selected', track === selected);

          const age = document.createElement('span');
          age.textContent = ` ${track.date ? formatRelativeAge(timestampMs, strings) : strings.live}`;
          age.style.color = `color-mix(in oklab, var(--green) ${freshness}%, var(--dim))`;
          button.append(age);

          button.addEventListener('click', () => {
            window.setTimeout(() => {
              showTrack(track);
            });
          });

          const item = document.createElement('li');
          item.append(button);
          return item;
        }),
      );
    };

    showTrack(latest);
  } catch {
    recentList.previousElementSibling?.remove();
    recentList.replaceChildren();
    root.replaceChildren(createErrorBanner(strings.broke));
  }
}

/** Initializes all `.now-playing` widgets on the page. */
export function initNowPlayingWidgets(): void {
  for (const widget of document.querySelectorAll<HTMLElement>('.now-playing')) {
    void hydrateWidget(widget);
  }
}
