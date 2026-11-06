"use client";

import { Post, User } from "@/lib/types";
import { deletePostAction } from "@/actions/post.actions";
import { useState, useTransition } from "react";
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
    <div className="group relative flex flex-col justify-between rounded-xl border border-muted bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-primary tracking-tight line-clamp-2">
            {post.title}
          </h3>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              onMouseLeave={() => setConfirmDelete(false)}
              className={`rounded-md p-1.5 transition-colors ${
                confirmDelete
                  ? "bg-destructive text-destructive-foreground"
                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              }`}
              title={confirmDelete ? "Click again to confirm delete" : "Delete post"}
            >
              {isDeleting ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconTrash className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6 leading-relaxed">
          {post.content}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between pt-3 border-t border-muted/60 text-[11px] text-muted-foreground">
        <Link
          href={`/aggregations?userId=${post.userId}`}
          className="flex items-center gap-1.5 font-medium text-primary hover:underline"
          title="Inspect user posts via Scenario 2 Aggregation"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-primary">
            <IconUser className="h-3 w-3" />
          </div>
          <span>{authorName}</span>
        </Link>

        <span className="flex items-center gap-1">
          <IconCalendar className="h-3 w-3" />
          {formattedDate}
        </span>
      </div>
    </div>
  );
}

