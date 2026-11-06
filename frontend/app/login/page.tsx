import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUserAction } from "@/actions/auth.actions";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUserAction();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8">
      <LoginForm />
    </div>
  );
}

