import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUserAction } from "@/actions/auth.actions";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUserAction();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8">
      <RegisterForm />
    </div>
  );
}

