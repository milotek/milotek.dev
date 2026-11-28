/**
 * @fileoverview Global UI sound effects and scroll-fade edge listeners.
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

const SCROLL_END_TOLERANCE_PX = 4;

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
    // Ignore autoplay rejections when the user has not interacted yet.
  });
}

/** Updates `.scrolled` and `.end` classes on scrollable containers for edge fades. */
function initScrollFadeContainers(): void {
  const containers = document.querySelectorAll<HTMLElement>('.scroller');

  for (const container of containers) {
    const updateScrollEdges = (): void => {
      const hasScrolled = container.scrollTop + container.scrollLeft > 0;
      const atVerticalEnd =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - SCROLL_END_TOLERANCE_PX;
      const atHorizontalEnd =
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - SCROLL_END_TOLERANCE_PX;

      container.classList.toggle('scrolled', hasScrolled);
      container.classList.toggle('end', atVerticalEnd && atHorizontalEnd);
    };

    container.addEventListener('scroll', updateScrollEdges, {passive: true});
  }
}

/** Attaches delegated pointerover and click listeners for UI sound effects. */
function initSoundEffects(): void {
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

/** Initializes global UI effects on the current page. */
export function initUiEffects(): void {
  initScrollFadeContainers();
  initSoundEffects();
}
