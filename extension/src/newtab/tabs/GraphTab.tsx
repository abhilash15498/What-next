import { useMemo } from 'react';
import ReactFlow, { Background, Controls, type Edge, type Node, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { buildInterestGraphEdges, topInterests } from '@whatnext/core';
import { useAppData } from '../../lib/AppDataContext';

function InterestNode({ data }: { data: { name: string; score: number; confidence: number; trend: string } }) {
  const trendGlyph = data.trend === 'rising' ? '↑' : data.trend === 'falling' ? '↓' : '→';
  return (
    <div className="rounded-xl border border-graph/40 bg-surface px-3 py-2 shadow-lg" style={{ minWidth: 140 }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium capitalize">{data.name.replace(/_/g, ' ')}</span>
        <span className="font-mono text-[11px] text-graph">{trendGlyph}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface2 overflow-hidden">
        <div className="h-full rounded-full bg-graph" style={{ width: `${data.score}%` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
        <span>{Math.round(data.score)}/100</span>
        <span>{Math.round(data.confidence * 100)}% conf</span>
      </div>
    </div>
  );
}

const nodeTypes = { interest: InterestNode };

export function GraphTab() {
  const { profile } = useAppData();

  const { nodes, edges } = useMemo(() => {
    const top = topInterests(profile, 16);
    const edgeData = buildInterestGraphEdges(profile, 0.12);

    const radius = 260;
    const cx = 400;
    const cy = 280;

    const nodes: Node[] = top.map((interest, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, top.length);
      return {
        id: interest.name,
        type: 'interest',
        position: {
          x: cx + radius * Math.cos(angle) - 70,
          y: cy + radius * Math.sin(angle) - 30,
        },
        data: { name: interest.name, score: interest.score, confidence: interest.confidence, trend: interest.trend },
      };
    });

    const nodeNames = new Set(top.map((n) => n.name));
    const edges: Edge[] = edgeData
      .filter((e) => nodeNames.has(e.source) && nodeNames.has(e.target))
      .map((e) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        style: { stroke: '#2E5F5D', strokeWidth: 1 + e.weight * 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2E5F5D', width: 14, height: 14 },
      }));

    return { nodes, edges };
  }, [profile]);

  if (nodes.length === 0) {
    return <p className="text-sm text-muted">No interests tracked yet — browse a bit and check back.</p>;
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-1">Interest Graph</h2>
      <p className="text-sm text-muted mb-4">
        Each node is an interest WhatNext has detected. Edges show interests that tend to show up together.
      </p>
      <div className="h-[560px] rounded-2xl border border-border bg-surface2/30 overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
          <Background color="#2A2E3D" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
