import { getCurrentUserAction } from "@/actions/auth.actions";
import { getNotesAction } from "@/actions/note.actions";
import { NotesView } from "@/components/notes/notes-view";
import Link from "next/link";
import { IconShieldLock, IconNotebook, IconArrowRight } from "@tabler/icons-react";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function HomePage(props: PageProps) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 6;
  const search = searchParams.search || "";

  const user = await getCurrentUserAction();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary shadow-xs">
          <IconShieldLock className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
          Secure Note-Taking &amp; RBAC Architecture
        </h1>

        <p className="mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed">
          Production-grade notes application featuring JSON Web Token authentication, role-based
          access permissions, Upstash Redis rate limiting, and indexed MongoDB aggregations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-sm transition-opacity"
          >
            Sign In to Your Workspace
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/posts"
            className="flex items-center gap-2 rounded-lg border border-muted bg-card px-5 py-2.5 text-xs font-semibold text-primary hover:bg-secondary transition-colors"
          >
            Explore Public Posts
          </Link>
        </div>
      </div>
    );
  }

  const notesResponse = await getNotesAction(page, limit);

  return (
    <NotesView
      initialNotes={notesResponse?.data || []}
      pagination={notesResponse?.pagination}
      user={user}
      searchQuery={search}
    />
  );
}
