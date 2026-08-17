"use client";

import { useEffect, useState } from "react";
import { MessageSquare, ThumbsUp, Trophy, Send } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import type { Roadmap } from "@/types";

interface CommunityInfo {
  id: string;
  path_slug: string;
  name: string;
  description: string;
}
interface Post {
  id: string;
  author_name: string;
  kind: string;
  title: string;
  body: string;
  upvotes: number;
  created_at: string;
}
interface LeaderboardEntry {
  rank: number;
  user_name: string;
  xp: number;
}

export default function CommunityPage() {
  const [pathSlug, setPathSlug] = useState<string | null>(null);
  const [community, setCommunity] = useState<CommunityInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api
      .get<Roadmap>("/roadmaps/active")
      .then((r) => setPathSlug(r.path_slug))
      .catch(() => setError("Start a roadmap to join your career community."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!pathSlug) return;
    Promise.all([
      api.get<CommunityInfo>(`/communities/${pathSlug}`),
      api.get<Post[]>(`/communities/${pathSlug}/posts`),
      api.get<LeaderboardEntry[]>(`/communities/${pathSlug}/leaderboard`),
    ])
      .then(([c, p, l]) => {
        setCommunity(c);
        setPosts(p);
        setLeaderboard(l);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "This community isn't set up yet."));
  }, [pathSlug]);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!pathSlug || !title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      const post = await api.post<Post>(`/communities/${pathSlug}/posts`, { kind: "discussion", title, body });
      setPosts((p) => [post, ...p]);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't post that.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">Community</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-100">{community?.name || "Your career community"}</h1>
        {community && <p className="mt-1 text-sm text-ink-500">{community.description}</p>}
      </div>

      {loading && <SkeletonCard />}
      {error && !community && (
        <EmptyState icon={MessageSquare} title="No community yet" description={error} />
      )}

      {community && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <form onSubmit={submitPost} className="space-y-3">
                  <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Textarea placeholder="Share a win, ask a question, or start a discussion..." rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
                  <Button type="submit" size="sm" loading={posting} className="gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Post
                  </Button>
                </form>
              </CardContent>
            </Card>

            {posts.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No posts yet" description="Be the first to share something with this community." />
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize">{post.kind}</Badge>
                      <span className="text-xs text-ink-500">{post.author_name}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-ink-100">{post.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-400">{post.body}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
                      <ThumbsUp className="h-3.5 w-3.5" /> {post.upvotes}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card>
            <CardContent className="p-5">
              <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-100">
                <Trophy className="h-4 w-4 text-warning" /> Leaderboard
              </p>
              <div className="space-y-2">
                {leaderboard.length === 0 && <p className="text-xs text-ink-500">No activity yet.</p>}
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between text-sm">
                    <span className="text-ink-400">#{entry.rank} {entry.user_name}</span>
                    <span className="font-medium text-ink-100">{entry.xp} XP</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
