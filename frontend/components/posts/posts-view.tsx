"use client";

import { Pagination, Post, User } from "@/lib/types";
import { PostCard } from "./post-card";
import { PostDialog } from "./post-dialog";
import { PaginationControls } from "../pagination-controls";
import { SearchFilter } from "../search-filter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus, IconArticle } from "@tabler/icons-react";
import Link from "next/link";

interface PostsViewProps {
  initialPosts: Post[];
  pagination?: Pagination;
  currentUser: User | null;
  searchQuery?: string;
}

export function PostsView({
  initialPosts,
  pagination,
  currentUser,
  searchQuery = ""
}: PostsViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredPosts = searchQuery
    ? initialPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : initialPosts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Public Community Feed
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Explore thoughts, articles, and discussions posted publicly by platform users.
          </p>
        </div>

        {currentUser ? (
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="self-start sm:self-auto gap-1.5 shadow-xs"
          >
            <IconPlus className="h-4 w-4" />
            New Post
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-1.5">
              Sign in to Post
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchFilter placeholder="Search public posts..." />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
            <IconArticle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-foreground">No posts available</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery
              ? `No posts matched "${searchQuery}".`
              : "Be the first to share an article or note with the community!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} currentUser={currentUser} />
          ))}
        </div>
      )}

      <PaginationControls pagination={pagination} />

      <PostDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
