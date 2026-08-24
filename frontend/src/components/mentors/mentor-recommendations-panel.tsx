"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Plus, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import type { MentorRecommendation, RoadmapCustomItem } from "@/types";

const TYPE_TONE: Record<string, "accent" | "success" | "warning"> = {
  skill: "accent",
  project: "success",
  follow_up: "warning",
};

/**
 * "YOUR MENTOR'S RECOMMENDATIONS" — real, mentor-authored suggestions the
 * mentee can pull into their roadmap as a RoadmapCustomItem. Deliberately
 * separate from the shared phase/project template content rendered below
 * it on the roadmap page (see RoadmapCustomItem's backend docstring).
 */
export function MentorRecommendationsPanel({ roadmapId }: { roadmapId: string }) {
  const [recommendations, setRecommendations] = useState<MentorRecommendation[] | null>(null);
  const [customItems, setCustomItems] = useState<RoadmapCustomItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptingKey, setAcceptingKey] = useState<string | null>(null);

  async function load() {
    try {
      const [recs, items] = await Promise.all([
        api.get<MentorRecommendation[]>("/mentor-recommendations/mine"),
        api.get<RoadmapCustomItem[]>(`/roadmaps/${roadmapId}/custom-items`),
      ]);
      setRecommendations(recs);
      setCustomItems(items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load mentor recommendations.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapId]);

  if (error) return null; // secondary section — fail quietly
  if (recommendations && recommendations.every((r) => r.items.length === 0) && (!customItems || customItems.length === 0)) {
    return null;
  }

  const alreadyAddedTitles = new Set((customItems || []).map((c) => c.title));

  async function accept(recId: string, itemIndex: number) {
    const key = `${recId}-${itemIndex}`;
    setAcceptingKey(key);
    try {
      await api.post(`/mentor-recommendations/${recId}/items/${itemIndex}/accept`, {});
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add that to your roadmap.");
    } finally {
      setAcceptingKey(null);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-accent-light" />
        <h3 className="text-sm font-semibold text-ink-100">Your mentor&apos;s recommendations</h3>
      </div>

      {customItems && customItems.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-ink-300">Added to your roadmap</p>
          {customItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5 rounded-xl border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.02)] px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink-100">{item.title}</p>
                  <Badge tone={TYPE_TONE[item.item_type] || "accent"}>{item.item_type.replace("_", " ")}</Badge>
                </div>
                {item.description && <p className="mt-0.5 text-xs text-ink-500">{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations
        ?.filter((rec) => rec.items.some((item) => !alreadyAddedTitles.has(item.title)))
        .map((rec) => (
          <div key={rec.id} className="space-y-2">
            {rec.items.map((item, index) =>
              alreadyAddedTitles.has(item.title) ? null : (
                <div
                  key={`${rec.id}-${index}`}
                  className="flex items-start gap-2.5 rounded-xl border border-accent/20 bg-accent/[0.04] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ink-100">{item.title}</p>
                      <Badge tone={TYPE_TONE[item.item_type] || "accent"}>{item.item_type.replace("_", " ")}</Badge>
                    </div>
                    {item.description && <p className="mt-0.5 text-xs text-ink-500">{item.description}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-shrink-0 gap-1"
                    loading={acceptingKey === `${rec.id}-${index}`}
                    onClick={() => accept(rec.id, index)}
                  >
                    <Plus className="h-3 w-3" /> Add to roadmap
                  </Button>
                </div>
              )
            )}
          </div>
        ))}
    </Card>
  );
}
