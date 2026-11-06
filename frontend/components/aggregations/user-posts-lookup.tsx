"use client";

import { useState, useTransition } from "react";
import { getUserPostsLookupAction, getUserProfileWithPostsAction } from "@/actions/aggregation.actions";
import { Post, UserWithPostsResult } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <IconArticle className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Scenario 2: User Posts ($lookup Pipeline)</CardTitle>
              <CardDescription className="text-xs">
                Retrieves all posts belonging to a particular user via a{" "}
                <strong>single aggregation pipeline with a $lookup stage</strong>, supported by an index on{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                  userId: 1, createdAt: -1
                </code>
                .
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 max-w-lg">
            <div className="relative w-full">
              <Input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter MongoDB User ID (e.g. 67...)"
                className="h-9 text-xs pl-8"
              />
              <IconUser className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <Button
              onClick={handleLookup}
              disabled={isPending || !userId.trim()}
              size="sm"
              className="w-full sm:w-auto h-9 gap-1.5 shrink-0"
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
            </Button>
          </div>
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/10 p-4 text-xs font-medium text-destructive">
          {errorMessage}
        </div>
      )}

      {profile && (
        <Card className="border-border bg-muted/20">
          <CardContent className="py-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Author: </span>
              <span className="font-bold text-foreground">{profile.name}</span>{" "}
              <span className="text-muted-foreground">({profile.email})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[11px]">Interests:</span>
              {profile.interests?.map((interest, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-medium bg-card">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Card key={post._id} className="border-border/80 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </CardContent>
              <CardFooter className="py-2.5 px-4 text-[11px] text-muted-foreground justify-between bg-muted/30">
                <span className="font-medium text-foreground">
                  {post.author?.name || profile?.name || "Author"}
                </span>
                <span className="flex items-center gap-1">
                  <IconCalendar className="h-3 w-3" />
                  {post.createdAt
                    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                    : "recently"}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
