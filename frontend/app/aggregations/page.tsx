import { getInterestsGroupAction, getUserPostsLookupAction } from "@/actions/aggregation.actions";
import { InterestsGroupView } from "@/components/aggregations/interests-group-view";
import { UserPostsLookup } from "@/components/aggregations/user-posts-lookup";
import { IconChartBar } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function AggregationsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const userId = searchParams.userId || "";

  const [interestsRes, userPostsRes] = await Promise.all([
    getInterestsGroupAction(),
    userId ? getUserPostsLookupAction(userId) : Promise.resolve({ success: true, data: [] })
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <IconChartBar className="h-6 w-6 text-primary" />
          MongoDB Aggregation Pipeline Showcase
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Demonstration of high-performance MongoDB aggregations strictly adhering to the technical
          interview constraints and indexing strategy.
        </p>
      </div>

      <InterestsGroupView groups={interestsRes?.data || []} />

      <UserPostsLookup initialUserId={userId} initialPosts={userPostsRes?.data || []} />
    </div>
  );
}

