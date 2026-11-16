import type { MindmapNode } from '../types/echonote';

/**
 * Converts EchoNote's nested { topic, children } JSON into Markdown headings/bullets
 * that markmap-lib's Transformer parses cleanly into an interactive SVG mindmap.
 */
export function mindmapJsonToMarkdown(node: MindmapNode, depth = 1): string {
  const safeTopic = (node.topic || 'Untitled Topic').replace(/\n/g, ' ').trim();
  const lines: string[] = [];

  if (depth <= 3) {
    lines.push(`${'#'.repeat(depth)} ${safeTopic}`);
  } else {
    const indent = '  '.repeat(depth - 4);
    lines.push(`${indent}- ${safeTopic}`);
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
