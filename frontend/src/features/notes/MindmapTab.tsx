import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ListTree,
  Network,
} from 'lucide-react';
import type { MindmapNode } from '../../types/echonote';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { countMindmapNodes, mindmapJsonToMarkdown } from '../../utils/mindmapFormat';

interface MindmapTabProps {
  mindmap: MindmapNode;
}

const transformer = new Transformer();

function setFoldRecursive(node: ReturnType<Transformer['transform']>['root'], fold: number, depth = 0) {
  if (depth >= 1) {
    node.payload = { ...(node.payload || {}), fold };
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      setFoldRecursive(child, fold, depth + 1);
    }
  }
}

function OutlineBranch({ node, depth = 0 }: { node: MindmapNode; depth?: number }) {
  return (
    <li className={depth === 0 ? '' : 'mt-2'}>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${
          depth === 0
            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
            : depth === 1
              ? 'bg-indigo-50 text-indigo-800 border-indigo-100 font-semibold'
              : 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
        }`}
      >
        {node.topic}
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="pl-6 mt-2 border-l border-slate-200 space-y-2">
          {node.children.map((child, idx) => (
            <OutlineBranch key={idx} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function MindmapTab({ mindmap }: MindmapTabProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mmRef = useRef<Markmap | null>(null);
  const rootRef = useRef<ReturnType<Transformer['transform']>['root'] | null>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'outline'>('canvas');

  const markdown = useMemo(() => mindmapJsonToMarkdown(mindmap), [mindmap]);
  const totalNodes = useMemo(() => countMindmapNodes(mindmap), [mindmap]);

  useEffect(() => {
    if (viewMode !== 'canvas' || !svgRef.current) return;

    svgRef.current.innerHTML = '';
    const { root } = transformer.transform(markdown);
    rootRef.current = root;

    const mm = Markmap.create(
      svgRef.current,
      {
        duration: 300,
        maxWidth: 260,
        paddingX: 16,
        spacingVertical: 8,
        spacingHorizontal: 80,
        autoFit: true,
      },
      root
    );
    mmRef.current = mm;

    const fitTimer = window.setTimeout(() => {
      mm.fit();
    }, 60);

    return () => {
      window.clearTimeout(fitTimer);
      mm.destroy();
      mmRef.current = null;
    };
  }, [markdown, viewMode]);

  const handleZoomIn = () => mmRef.current?.rescale(1.25);
  const handleZoomOut = () => mmRef.current?.rescale(0.8);
  const handleFit = () => mmRef.current?.fit();

  const handleToggleCollapse = () => {
    if (!mmRef.current || !rootRef.current) return;
    const nextCollapsed = !collapsed;
    setFoldRecursive(rootRef.current, nextCollapsed ? 1 : 0);
    mmRef.current.setData(rootRef.current);
    mmRef.current.fit();
    setCollapsed(nextCollapsed);
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <h3 className="text-base font-bold text-slate-900">Concept Mindmap</h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {totalNodes} connected concepts · Click nodes to expand or collapse, drag to pan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'canvas'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Interactive Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('outline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'outline'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              Outline
            </button>
          </div>

          {viewMode === 'canvas' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomOut}
                aria-label="Zoom out mindmap"
                icon={<ZoomOut className="w-3.5 h-3.5" />}
              >
                Zoom out
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomIn}
                aria-label="Zoom in mindmap"
                icon={<ZoomIn className="w-3.5 h-3.5" />}
              >
                Zoom in
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleCollapse}
                icon={
                  collapsed ? (
                    <Maximize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Minimize2 className="w-3.5 h-3.5" />
                  )
                }
              >
                {collapsed ? 'Expand all' : 'Collapse'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleFit}>
                Fit view
              </Button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'canvas' ? (
        <div className="markmap-container h-[520px] w-full bg-white p-4 relative">
          <svg
            ref={svgRef}
            data-testid="mindmap-svg"
            role="img"
            aria-label={`Interactive mindmap for ${mindmap.topic}`}
            className="w-full h-full block"
          />
        </div>
      ) : (
        <div className="p-6 bg-white">
          <ul className="space-y-3">
            <OutlineBranch node={mindmap} />
          </ul>
        </div>
      )}
    </Card>
  );
}
