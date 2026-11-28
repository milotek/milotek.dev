/**
 * @fileoverview Global UI hover and click sound effects.
 */

import {url} from '../lib/url';

const CLICK_SOUND_SELECTOR = [
  '.button',
  'a.chip',
  '.project-card',
  'a.web-button-badge',
  '.github-repos a',
  'nav a',
  '.hero button',
  '.recent-tracks button',
  '.waveform',
].join(', ');

const soundCache = new Map<string, HTMLAudioElement>();

/** Plays a cached UI sound effect from `public/audio/ui/<name>.mp3`. */
function playSoundEffect(name: 'hover' | 'click'): void {
  let audio = soundCache.get(name);
  if (!audio) {
    audio = new Audio(url(`audio/ui/${name}.mp3`));
    soundCache.set(name, audio);
  }
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Ignore autoplay rejections before the first user interaction.
  });
}

/** Attaches delegated pointerover and click listeners for UI sound effects. */
export function initUiEffects(): void {
  let lastPointerCoords = '';

  window.addEventListener('pointerover', (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest('.button');
    if (!button) {
      return;
    }

    const related = event.relatedTarget;
    if (related instanceof Node && button.contains(related)) {
      return;
    }

    // Avoid re-triggering hover audio when layout shifts under a stationary pointer.
    const pointerCoords = `${event.screenX},${event.screenY}`;
    if (pointerCoords === lastPointerCoords) {
      return;
    }

    lastPointerCoords = pointerCoords;
    playSoundEffect('hover');
  });

  window.addEventListener('click', (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest(CLICK_SOUND_SELECTOR)) {
      playSoundEffect('click');
    }
  });
}
