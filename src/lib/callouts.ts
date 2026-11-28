/**
 * @fileoverview Satteri MDAST plugin that transforms Obsidian-style callouts
 * (`> [!note] ...`) into semantic `<aside class="callout">` elements.
 */

import type {MdastPluginDefinition} from 'satteri';

declare module 'mdast' {
  interface Data {
    hName?: string;
    hProperties?: Record<string, unknown>;
  }
}

const CALLOUT_MARKER_PATTERN = /^\[!(\w+)\][+-]?\s*/;

/**
 * Transforms blockquotes whose first paragraph begins with `[!type]` into
 * `<aside class="callout" data-callout="type">`.
 */
export const calloutsPlugin: MdastPluginDefinition = {
  name: 'callouts',
  blockquote(quote) {
    const [firstChild, ...remainingChildren] = quote.children;
    if (firstChild?.type !== 'paragraph') {
      return;
    }

    const [leadingInline, ...remainingInline] = firstChild.children;
    if (leadingInline?.type !== 'text') {
      return;
    }

    const match = CALLOUT_MARKER_PATTERN.exec(leadingInline.value);
    if (!match || !match[1]) {
      return;
    }

    const calloutType = match[1].toLowerCase();
    const strippedLeadingText = {
      ...leadingInline,
      value: leadingInline.value.slice(match[0].length),
    };
    const updatedFirstParagraph = {
      ...firstChild,
      children: [strippedLeadingText, ...remainingInline],
    };

    return {
      type: 'blockquote',
      children: [updatedFirstParagraph, ...remainingChildren],
      data: {
        hName: 'aside',
        hProperties: {
          className: ['callout'],
          dataCallout: calloutType,
        },
      },
    };
  },
};
