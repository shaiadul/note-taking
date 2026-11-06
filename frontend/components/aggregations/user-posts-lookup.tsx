"use client";

import { useState, useTransition } from "react";
import { getUserPostsLookupAction, getUserProfileWithPostsAction } from "@/actions/aggregation.actions";
import { Post, UserWithPostsResult } from "@/lib/types";
import { IconArticle, IconSearch, IconLoader2, IconUser, IconCalendar } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

interface UserPostsLookupProps {
  initialUserId?: string;
  initialPosts?: Post[];
}

export function UserPostsLookup({
  initialUserId = "",
  initialPosts = []
}: UserPostsLookupProps) {
  const [userId, setUserId] = useState(initialUserId);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [profile, setProfile] = useState<UserWithPostsResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLookup = () => {
    if (!userId.trim()) return;

    setErrorMessage(null);
    startTransition(async () => {
      const postsRes = await getUserPostsLookupAction(userId.trim());
      const profileRes = await getUserProfileWithPostsAction(userId.trim());

      if (!postsRes.success && !profileRes.success) {
        setErrorMessage(postsRes.error || "No posts or user found for provided ID");
        setPosts([]);
        setProfile(null);
        return;
      }

      setPosts(postsRes.data || []);
      setProfile(profileRes.data || null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-muted bg-card p-5">
        <div className="flex items-center gap-2 text-primary">
          <IconArticle className="h-5 w-5 text-emerald-500" />
          <h2 className="text-base font-bold">Scenario 2: User Posts ($lookup Pipeline)</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Retrieves all posts belonging to a particular user via a{" "}
          <strong>single aggregation pipeline with a $lookup stage</strong>, supported by an index on{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-primary">
            userId: 1, createdAt: -1
          </code>
          .
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <IconUser className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter MongoDB User ID (e.g., 67...)"
              className="w-full rounded-lg border border-muted bg-secondary/30 py-2.5 pl-9 pr-3 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={isPending || !userId.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-xs"
          >
            {isPending ? (
              <>
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                Aggregating...
              </>
            ) : (
              <>
                <IconSearch className="h-3.5 w-3.5" />
                Execute $lookup
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 p-4 text-xs font-medium text-destructive">
          {errorMessage}
        </div>
      )}

      {profile && (
        <div className="rounded-xl border border-muted bg-secondary/40 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Author: </span>
            <span className="font-bold text-primary">{profile.name}</span>{" "}
            <span className="text-muted-foreground">({profile.email})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Interests:</span>
            {profile.interests?.map((interest, i) => (
              <span key={i} className="rounded-md bg-card px-2 py-0.5 text-[10px] font-medium border border-muted">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="flex flex-col justify-between rounded-xl border border-muted bg-card p-5 shadow-xs"
            >
              <div>
                <h3 className="text-sm font-bold text-primary">{post.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-muted/60 text-[11px] text-muted-foreground">
                <span className="font-medium text-primary">
                  {post.author?.name || profile?.name || "Author"}
                </span>
                <span className="flex items-center gap-1">
                  <IconCalendar className="h-3 w-3" />
                  {post.createdAt
                    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                    : "recently"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

