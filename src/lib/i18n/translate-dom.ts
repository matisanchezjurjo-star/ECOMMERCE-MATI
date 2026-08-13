const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"]);

/** Strings that are just numbers/currency/punctuation don't need translating. */
const NON_TRANSLATABLE = /^[\s\d$€£%.,+\-–—:/x×]*$/i;

export interface CapturedNode {
  node: Text;
  original: string;
}

export function collectTextNodes(root: HTMLElement): CapturedNode[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      const text = node.textContent ?? "";
      if (!text.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const results: CapturedNode[] = [];
  let current = walker.nextNode();
  while (current) {
    results.push({ node: current as Text, original: current.textContent ?? "" });
    current = walker.nextNode();
  }
  return results;
}

export function translatableStrings(nodes: CapturedNode[]): string[] {
  const seen = new Set<string>();
  for (const { original } of nodes) {
    const trimmed = original.trim();
    if (trimmed && !NON_TRANSLATABLE.test(trimmed)) seen.add(trimmed);
  }
  return Array.from(seen);
}

export function applyTranslations(nodes: CapturedNode[], translationMap: Map<string, string>) {
  for (const entry of nodes) {
    const trimmed = entry.original.trim();
    const translated = translationMap.get(trimmed);
    if (!translated) continue;
    // Preserve original leading/trailing whitespace so layout spacing doesn't shift.
    const leading = entry.original.match(/^\s*/)?.[0] ?? "";
    const trailing = entry.original.match(/\s*$/)?.[0] ?? "";
    entry.node.textContent = `${leading}${translated}${trailing}`;
  }
}

export function restoreOriginal(nodes: CapturedNode[]) {
  for (const entry of nodes) {
    entry.node.textContent = entry.original;
  }
}
