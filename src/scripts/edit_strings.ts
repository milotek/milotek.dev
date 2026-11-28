/**
 * @fileoverview `?edit` mode: edit i18n strings in place or in a side panel,
 * then copy the changes as JSON to bake into `src/i18n/en.ts`.
 */

import {EN_STRINGS} from '../i18n/en';

type Key = keyof typeof EN_STRINGS;

const STORAGE_KEY = 'edit-strings';
const original = EN_STRINGS as Record<Key, string>;
const keys = Object.keys(original) as Key[];
const drafts: Partial<Record<Key, string>> = JSON.parse(
  localStorage.getItem(STORAGE_KEY) ?? '{}',
);
const elementsByKey = new Map<Key, HTMLElement[]>();
const rows = new Map<Key, HTMLTextAreaElement>();

const STYLE = `
  [data-key] { outline: 1px dashed var(--pink); outline-offset: 2px; cursor: text; }
  [data-key]:focus { outline-style: solid; }
  .edit-panel { position: fixed; top: 0; right: 0; bottom: 0; z-index: 1000; width: min(380px, 100vw);
    display: flex; flex-direction: column; background: var(--mantle); border-left: 2px solid var(--pink); font-size: 13px; }
  .edit-panel header { display: flex; gap: 6px; padding: 10px; align-items: center; }
  .edit-panel header span { flex: 1; }
  .edit-panel input, .edit-panel textarea { width: 100%; background: var(--base); color: var(--text);
    border: 1px solid var(--line); font: inherit; padding: 6px; }
  .edit-panel input { margin: 0 10px 10px; width: calc(100% - 20px); }
  .edit-panel ol { overflow-y: auto; padding: 0 10px 10px; }
  .edit-panel li { margin-bottom: 10px; }
  .edit-panel li[hidden] { display: none; }
  .edit-panel label { display: block; color: var(--dim); margin-bottom: 2px; }
  .edit-panel textarea { field-sizing: content; resize: none; }
  .edit-panel textarea.changed { border-color: var(--pink); }
  body.edit-panel-closed .edit-panel ol, body.edit-panel-closed .edit-panel > input { display: none; }
  body.edit-panel-closed .edit-panel { bottom: auto; }
  body:not(.edit-panel-closed) { padding-right: min(380px, 100vw); }
`;

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, '');
}

const isHtml = (key: Key) => original[key].includes('<');

function readElement(key: Key, el: HTMLElement): string {
  return isHtml(key)
    ? el.innerHTML.replaceAll('&nbsp;', ' ')
    : el.textContent.replaceAll('\u00a0', ' ');
}

function writeElement(key: Key, el: HTMLElement, value: string): void {
  if (isHtml(key)) {
    el.innerHTML = value;
  } else {
    el.textContent = value;
  }
}

/** Prefers the key whose section matches the page, so "about" on /about/ is `about.title`. */
function pickKey(candidates: Key[]): Key {
  const section = location.pathname.split('/')[1] || 'home';
  return candidates.find((key) => key.startsWith(`${section}.`)) ?? candidates[0];
}

function tagPage(): void {
  const keysByText = new Map<string, Key[]>();
  for (const key of keys) {
    if (key === 'lang' || original[key].includes('{')) {
      continue;
    }
    const text = stripTags(original[key]).trim();
    keysByText.set(text, [...(keysByText.get(text) ?? []), key]);
  }

  const matches = [...document.body.querySelectorAll<HTMLElement>('*')].filter(
    (el) =>
      !el.closest('.marquee, script, style, svg') &&
      keysByText.has(el.textContent.trim()),
  );
  for (const el of matches) {
    if (matches.some((other) => other !== el && el.contains(other))) {
      continue;
    }
    const key = pickKey(keysByText.get(el.textContent.trim())!);
    el.dataset.key = key;
    el.contentEditable = 'true';
    elementsByKey.set(key, [...(elementsByKey.get(key) ?? []), el]);
  }
}

function setDraft(key: Key, value: string, source?: HTMLElement): void {
  if (value === original[key]) {
    delete drafts[key];
  } else {
    drafts[key] = value;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  for (const el of elementsByKey.get(key) ?? []) {
    if (el !== source) {
      writeElement(key, el, value);
    }
  }
  const row = rows.get(key)!;
  if (row.value !== value) {
    row.value = value;
  }
  row.classList.toggle('changed', key in drafts);
  updateCount();
}

let countLabel: HTMLSpanElement;
function updateCount(): void {
  countLabel.textContent = `${Object.keys(drafts).length} changed`;
}

function buildPanel(): void {
  const panel = document.createElement('aside');
  panel.className = 'edit-panel mono';
  panel.innerHTML = `
    <header>
      <span></span>
      <button class="button" type="button" data-do="copy">copy</button>
      <button class="button" type="button" data-do="reset">reset</button>
      <button class="button" type="button" data-do="hide">hide</button>
    </header>
    <input type="search" placeholder="filter keys or text">
    <ol></ol>
  `;
  countLabel = panel.querySelector('span')!;
  const list = panel.querySelector('ol')!;

  for (const key of keys) {
    const item = document.createElement('li');
    const label = document.createElement('label');
    const textarea = document.createElement('textarea');
    label.textContent = elementsByKey.has(key) ? `${key} · on page` : key;
    textarea.value = drafts[key] ?? original[key];
    textarea.classList.toggle('changed', key in drafts);
    textarea.addEventListener('input', () => setDraft(key, textarea.value));
    label.append(textarea);
    item.append(label);
    list.append(item);
    rows.set(key, textarea);
  }

  panel.querySelector('input')!.addEventListener('input', (event) => {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    for (const [key, textarea] of rows) {
      textarea.closest('li')!.hidden =
        !!query && !`${key} ${textarea.value}`.toLowerCase().includes(query);
    }
  });

  panel.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).dataset.do;
    if (action === 'copy') {
      navigator.clipboard.writeText(JSON.stringify(drafts, null, 2));
    } else if (action === 'reset' && confirm('Drop every edit?')) {
      for (const key of Object.keys(drafts) as Key[]) {
        setDraft(key, original[key]);
      }
    } else if (action === 'hide') {
      document.body.classList.toggle('edit-panel-closed');
    }
  });

  document.body.append(panel);
  updateCount();
}

export function initEditStrings(): void {
  const style = document.createElement('style');
  style.textContent = STYLE;
  document.head.append(style);

  tagPage();
  buildPanel();
  for (const key of Object.keys(drafts) as Key[]) {
    setDraft(key, drafts[key]!);
  }

  document.addEventListener('input', (event) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-key]');
    if (el) {
      const key = el.dataset.key as Key;
      setDraft(key, readElement(key, el), el);
    }
  });
  document.addEventListener('focusin', (event) => {
    const key = (event.target as HTMLElement).dataset?.key as Key | undefined;
    rows.get(key!)?.scrollIntoView({block: 'nearest'});
  });
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      if (target.closest('[data-key]') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
      } else if (link?.origin === location.origin) {
        link.search = '?edit';
      }
    },
    true,
  );
}
