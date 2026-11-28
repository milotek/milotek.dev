/**
 * @fileoverview Interactive easter-egg controls in the site hero banner.
 *
 * - `aaaa`: replaces every letter on the page with `a`/`A` (preserving case).
 * - `flip`: horizontally mirrors the hero banner.
 * - `swap`: swaps the hero portrait with an alternate image.
 */

/** Initializes the hero control buttons if the hero banner is present. */
export function initHeroControls(): void {
  const hero = document.querySelector<HTMLElement>('.hero');
  const [primaryPhoto, alternatePhoto] =
    hero?.querySelectorAll<HTMLImageElement>('.hero-photo') ?? [];
  if (!hero || !primaryPhoto || !alternatePhoto) {
    return;
  }

  const originalText = new Map<Text, string>();

  const replaceLetters = (root: Node): void => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const textNode = node as Text;
      if (textNode.parentElement?.closest('script, style')) {
        continue;
      }
      const next = textNode.data.replace(/\p{L}/gu, (ch) =>
        ch === ch.toLowerCase() ? 'a' : 'A',
      );
      if (next !== textNode.data) {
        originalText.set(textNode, textNode.data);
        textNode.data = next;
      }
    }
  };

  // Keeps dynamically loaded text (such as Last.fm tracks) converted too.
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      replaceLetters(record.target.parentNode ?? record.target);
    }
  });

  const bindToggle = (
    action: string,
    onToggle: (enabled: boolean) => void,
  ): void => {
    const button = hero.querySelector<HTMLButtonElement>(
      `.hero-controls button[data-action="${action}"]`,
    );
    button?.addEventListener('click', () => {
      const next = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(next));
      onToggle(next);
    });
  };

  bindToggle('aaaa', (enabled) => {
    if (enabled) {
      replaceLetters(document.body);
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
      });
      return;
    }
    observer.disconnect();
    for (const [textNode, saved] of originalText) {
      textNode.data = saved;
    }
    originalText.clear();
  });

  bindToggle('flip', (enabled) => {
    hero.classList.toggle('flipped', enabled);
  });

  bindToggle('swap', (enabled) => {
    primaryPhoto.hidden = enabled;
    alternatePhoto.hidden = !enabled;
  });
}
