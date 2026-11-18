import type { MindmapNode } from '../types/echonote';

/**
 * Converts Notewise's nested mindmap JSON into Markdown headings/bullets
 * that markmap-lib's Transformer parses cleanly into an interactive SVG mindmap.
 *
 * Supports both field names to handle backend variance:
 *   - node.title  (canonical — matches database/prompts/mindmap.schema.json)
 *   - node.topic  (legacy / alternate)
 */
export function mindmapJsonToMarkdown(node: MindmapNode, depth = 1): string {
  // Accept either "title" (schema spec) or "topic" (legacy) — whichever is present
  const label = (node.title || node.topic || 'Untitled Topic').replace(/\n/g, ' ').trim();
  const lines: string[] = [];

  if (depth <= 3) {
    lines.push(`${'#'.repeat(depth)} ${label}`);
  } else {
    const indent = '  '.repeat(depth - 4);
    lines.push(`${indent}- ${label}`);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      lines.push(mindmapJsonToMarkdown(child, depth + 1));
    }
  }

  return lines.join('\n');
}

/**
 * Counts total nodes in a mindmap tree for summary badges and accessibility descriptions.
 */
export function countMindmapNodes(node: MindmapNode | null | undefined): number {
  if (!node) return 0;
  let total = 1;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      total += countMindmapNodes(child);
    }
  }
  return total;
}
