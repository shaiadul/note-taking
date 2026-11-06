import { getCurrentUserAction } from "@/actions/auth.actions";
import { getPostsAction } from "@/actions/post.actions";
import { PostsView } from "@/components/posts/posts-view";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function PostsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 6;
  const search = searchParams.search || "";

  const [currentUser, postsResponse] = await Promise.all([
    getCurrentUserAction(),
    getPostsAction(page, limit)
  ]);

  return (
    <PostsView
      initialPosts={postsResponse?.data || []}
      pagination={postsResponse?.pagination}
      currentUser={currentUser}
      searchQuery={search}
    />
  );
}

