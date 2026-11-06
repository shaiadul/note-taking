"use client";

import { Post, User } from "@/lib/types";
import { deletePostAction } from "@/actions/post.actions";
import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTrash, IconLoader2, IconCalendar, IconUser } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PostCardProps {
  post: Post;
  currentUser: User | null;
}

export function PostCard({ post, currentUser }: PostCardProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canDelete =
    currentUser && (currentUser.role === "admin" || currentUser._id === post.userId);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    startDeleteTransition(async () => {
      await deletePostAction(post._id);
    });
  };

  const formattedDate = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "recently";

  const authorName = post.author?.name || "Community Member";

  return (
    <Card className="group relative border-border/80 hover:border-primary/40 hover:shadow-sm transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground tracking-tight line-clamp-2 pr-12">
          {post.title}
        </CardTitle>
        {canDelete && (
          <CardAction>
            <Button
              variant={confirmDelete ? "destructive" : "ghost"}
              size="icon-xs"
              onClick={handleDelete}
              disabled={isDeleting}
              onMouseLeave={() => setConfirmDelete(false)}
              title={confirmDelete ? "Click again to confirm delete" : "Delete post"}
              className={confirmDelete ? "px-2 w-auto h-6 text-[10px]" : "text-muted-foreground hover:text-destructive"}
            >
              {isDeleting ? (
                <IconLoader2 className="h-3 w-3 animate-spin" />
              ) : confirmDelete ? (
                "Confirm?"
              ) : (
                <IconTrash className="h-3.5 w-3.5" />
              )}
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6 leading-relaxed">
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="py-2.5 px-4 text-[11px] text-muted-foreground justify-between bg-muted/30">
        <Link
          href={`/aggregations?userId=${post.userId}`}
          className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
          title="Inspect user posts via Scenario 2 Aggregation"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-primary">
            <IconUser className="h-3 w-3" />
          </div>
          <span className="hover:underline">{authorName}</span>
        </Link>

        <span className="flex items-center gap-1">
          <IconCalendar className="h-3 w-3" />
          {formattedDate}
        </span>
      </CardFooter>
    </Card>
  );
}
