import { getCurrentUserAction } from "@/actions/auth.actions";
import { getUsersAction } from "@/actions/user.actions";
import { UserManagement } from "@/components/admin/user-management";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
  }>;
}

export default async function AdminPage(props: PageProps) {
  const user = await getCurrentUserAction();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 10;
  const search = searchParams.search || "";

  const usersResponse = await getUsersAction(page, limit);

  return (
    <UserManagement
      initialUsers={usersResponse?.data || []}
      pagination={usersResponse?.pagination}
      searchQuery={search}
    />
  );
}

