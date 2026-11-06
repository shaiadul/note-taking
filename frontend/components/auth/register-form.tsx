"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, RegisterFormValues } from "@/lib/schemas";
import { registerAction } from "@/actions/auth.actions";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import {
  IconLock,
  IconMail,
  IconUser,
  IconTags,
  IconAlertCircle,
  IconLoader2
} from "@tabler/icons-react";

export function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      interests: "chess, coding, reading"
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await registerAction(data);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to register account");
        return;
      }
      router.push("/");
      router.refresh();
    });
  };

  return (
    <Card className="w-full max-w-md shadow-sm border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
        <CardDescription className="text-xs">
          Sign up to begin managing your encrypted notes
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
              <IconUser className="h-3.5 w-3.5 text-muted-foreground" />
              Full Name
            </label>
            <Input
              type="text"
              {...register("name")}
              placeholder="John Doe"
              className="h-9 text-xs"
            />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <IconMail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Address
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              className="h-9 text-xs"
            />
            {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Role</label>
              <NativeSelect {...register("role")} className="w-full">
                <NativeSelectOption value="user">User</NativeSelectOption>
                <NativeSelectOption value="admin">Admin</NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <IconTags className="h-3 w-3 text-muted-foreground" />
                Interests <span className="font-normal text-muted-foreground">(csv)</span>
              </label>
              <Input
                type="text"
                {...register("interests")}
                placeholder="chess, reading"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-9 text-xs font-semibold gap-2 mt-2"
          >
            {isPending ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border pt-4 text-xs text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-primary ml-1 hover:underline">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
