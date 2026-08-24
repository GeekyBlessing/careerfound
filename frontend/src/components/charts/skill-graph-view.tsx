"use client";

import { ArrowDown } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress";
import type { SkillGraph } from "@/types";

/**
 * Renders the skill dependency graph as an ordered, connected list (a
 * topological read-out of the DAG) rather than a full force-directed graph —
 * this is far more legible for a linear-ish curriculum like ours, while
 * still visually communicating "this skill unlocks the next."
 */
export function SkillGraphView({ graph }: { graph: SkillGraph }) {
  const orderedNodes = topologicalOrder(graph);

  return (
    <div className="space-y-1">
      {orderedNodes.map((node, i) => (
        <div key={node.id}>
          <div className="flex items-center gap-4 rounded-xl border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.02)] px-4 py-3">
            <div className="flex-1">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-ink-100">{node.label}</span>
                <span className="text-xs text-ink-500">{node.mastery_pct}%</span>
              </div>
              <ProgressBar value={node.mastery_pct} tone={node.mastery_pct >= 80 ? "success" : "accent"} />
            </div>
          </div>
          {i < orderedNodes.length - 1 && (
            <div className="flex justify-center py-1">
              <ArrowDown className="h-3.5 w-3.5 text-ink-700" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function topologicalOrder(graph: SkillGraph) {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const incoming = new Map(graph.nodes.map((n) => [n.id, 0]));
  const adjacency = new Map<string, string[]>();

  for (const edge of graph.edges) {
    incoming.set(edge.to_id, (incoming.get(edge.to_id) || 0) + 1);
    adjacency.set(edge.from_id, [...(adjacency.get(edge.from_id) || []), edge.to_id]);
  }

  const queue = graph.nodes.filter((n) => (incoming.get(n.id) || 0) === 0).map((n) => n.id);
  const result: string[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    result.push(id);
    for (const next of adjacency.get(id) || []) {
      incoming.set(next, (incoming.get(next) || 0) - 1);
      if ((incoming.get(next) || 0) <= 0) queue.push(next);
    }
  }

  // Any nodes not reached (disconnected) get appended at the end.
  for (const n of graph.nodes) {
    if (!visited.has(n.id)) result.push(n.id);
  }

  return result.map((id) => nodeMap.get(id)!).filter(Boolean);
}
