"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormValues } from "@/lib/schemas";
import { loginAction } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { IconLock, IconMail, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await loginAction(data);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to log in");
        return;
      }
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-muted bg-card p-6 sm:p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Welcome Back</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter your credentials to access your secure workspace
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-primary mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <IconMail className="h-4 w-4" />
            </div>
            <input
              type="email"
              {...register("email")}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-muted bg-secondary/30 py-2.5 pl-9 pr-3 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[11px] text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-primary mb-1">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <IconLock className="h-4 w-4" />
            </div>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="w-full rounded-lg border border-muted bg-secondary/30 py-2.5 pl-9 pr-3 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-[11px] text-destructive">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-xs"
        >
          {isPending ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create one now
        </Link>
      </div>
    </div>
  );
}

