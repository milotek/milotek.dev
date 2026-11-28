/**
 * @fileoverview Interactive easter-egg controls in the site hero banner.
 *
 * Supports three toggles:
 * - `aaaa`: replaces every letter on the page with `a`/`A` (preserving case).
 * - `flip`: horizontally mirrors the hero banner.
 * - `swap`: swaps the hero portrait with an alternate image.
 */

type HeroAction = 'aaaa' | 'flip' | 'swap';

/** Initializes the hero control buttons if the hero banner is present. */
export function initHeroControls(): void {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) {
    return;
  }

  const photos = hero.querySelectorAll<HTMLImageElement>('.hero-photo');
  const primaryPhoto = photos[0];
  const alternatePhoto = photos[1];
  if (!primaryPhoto || !alternatePhoto) {
    return;
  }

  const actionButtons = new Map<HeroAction, HTMLButtonElement>();
  for (const button of hero.querySelectorAll<HTMLButtonElement>(
    '.hero-controls button',
  )) {
    const action = button.dataset.action as HeroAction | undefined;
    if (action) {
      actionButtons.set(action, button);
    }
  }

  const originalTextNodes = new Map<Text, string>();

  const setButtonPressed = (action: HeroAction, isPressed: boolean): void => {
    const button = actionButtons.get(action);
    if (button) {
      button.setAttribute('aria-pressed', String(isPressed));
    }
  };

  const replaceLettersWithA = (root: Node): void => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();

    while (currentNode) {
      const textNode = currentNode as Text;
      const insideNonVisibleTag =
        textNode.parentElement?.closest('script, style') !== null;

      if (!insideNonVisibleTag) {
        const replaced = textNode.data.replace(/\p{L}/gu, (letter) => {
          return letter === letter.toLowerCase() ? 'a' : 'A';
        });
        if (replaced !== textNode.data) {
          originalTextNodes.set(textNode, textNode.data);
          textNode.data = replaced;
        }
      }

      currentNode = walker.nextNode();
    }
  };

  // Keeps dynamically loaded text (such as Last.fm tracks) converted as well.
  const mutationObserver = new MutationObserver((records) => {
    for (const record of records) {
      replaceLettersWithA(record.target.parentNode ?? record.target);
    }
  });

  const setAaaaMode = (enabled: boolean): void => {
    setButtonPressed('aaaa', enabled);
    if (enabled) {
      replaceLettersWithA(document.body);
      mutationObserver.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
      });
      return;
    }

    mutationObserver.disconnect();
    for (const [textNode, originalText] of originalTextNodes) {
      textNode.data = originalText;
    }
    originalTextNodes.clear();
  };

  const setFlipMode = (enabled: boolean): void => {
    hero.classList.toggle('flipped', enabled);
    setButtonPressed('flip', enabled);
  };

  const setSwapMode = (enabled: boolean): void => {
    primaryPhoto.hidden = enabled;
    alternatePhoto.hidden = !enabled;
    setButtonPressed('swap', enabled);
  };

  actionButtons.get('aaaa')?.addEventListener('click', () => {
    setAaaaMode(originalTextNodes.size === 0);
  });

  actionButtons.get('flip')?.addEventListener('click', () => {
    setFlipMode(!hero.classList.contains('flipped'));
  });

  actionButtons.get('swap')?.addEventListener('click', () => {
    setSwapMode(!primaryPhoto.hidden);
  });
}
