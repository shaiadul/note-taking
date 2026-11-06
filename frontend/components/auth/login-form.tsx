"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormValues } from "@/lib/schemas";
import { loginAction } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <Card className="w-full max-w-md shadow-sm border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
        <CardDescription className="text-xs">
          Enter your credentials to access your secure workspace
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
            <IconAlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <IconMail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Address
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="user@example.com"
              className="h-9 text-xs"
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <IconLock className="h-3.5 w-3.5 text-muted-foreground" />
              Password
            </label>
            <Input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="h-9 text-xs"
            />
            {errors.password && (
              <p className="text-[11px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-9 text-xs font-semibold gap-2 mt-2"
          >
            {isPending ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border pt-4 text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary ml-1 hover:underline">
          Create one now
        </Link>
      </CardFooter>
    </Card>
  );
}
