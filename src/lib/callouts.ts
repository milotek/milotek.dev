import type { MdastPluginDefinition } from 'satteri';

declare module 'mdast' {
  interface Data {
    hName?: string;
    hProperties?: Record<string, unknown>;
  }
}

export const callouts: MdastPluginDefinition = {
  name: 'callouts',
  blockquote(quote) {
    const [first, ...rest] = quote.children;
    if (first?.type !== 'paragraph') return;
    const [lead, ...inline] = first.children;
    if (lead?.type !== 'text') return;
    const marker = /^\[!(\w+)\][+-]?\s*/.exec(lead.value);
    if (!marker) return;

    return {
      type: 'blockquote',
      children: [{ ...first, children: [{ ...lead, value: lead.value.slice(marker[0].length) }, ...inline] }, ...rest],
      data: { hName: 'aside', hProperties: { className: ['callout'], dataCallout: marker[1]!.toLowerCase() } },
    };
  },
};
