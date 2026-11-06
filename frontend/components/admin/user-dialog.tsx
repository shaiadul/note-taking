"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userEditFormSchema, UserEditFormValues } from "@/lib/schemas";
import { createUserAction, updateUserAction } from "@/actions/user.actions";
import { User } from "@/lib/types";
import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { IconX, IconLoader2 } from "@tabler/icons-react";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export function UserDialog({ isOpen, onClose, userToEdit }: UserDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      interests: ""
    }
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "",
        role: userToEdit.role,
        interests: userToEdit.interests?.join(", ") || ""
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        role: "user",
        interests: ""
      });
    }
    setErrorMessage(null);
  }, [userToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: UserEditFormValues) => {
    setErrorMessage(null);
    startTransition(async () => {
      let result;
      if (userToEdit) {
        result = await updateUserAction(userToEdit._id, data);
      } else {
        result = await createUserAction(data);
      }

      if (!result.success) {
        setErrorMessage(result.error || "Failed to save user");
        return;
      }

      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
      <Card className="relative w-full max-w-md border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150 p-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground">
            {userToEdit ? "Edit User Account" : "Create New User"}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <IconX className="h-4 w-4" />
          </Button>
        </CardHeader>

        {errorMessage && (
          <div className="mx-6 mt-3 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <Input
                type="text"
                {...register("name")}
                placeholder="Jane Doe"
                className="h-9 text-xs"
              />
              {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <Input
                type="email"
                {...register("email")}
                placeholder="jane@example.com"
                className="h-9 text-xs"
              />
              {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Password {userToEdit && <span className="font-normal text-muted-foreground">(leave blank to keep current)</span>}
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
                <label className="text-xs font-semibold text-foreground">
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
          </CardContent>

          <CardFooter className="justify-end gap-2 border-t border-border pt-3 pb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending && <IconLoader2 className="h-3.5 w-3.5 animate-spin" />}
              {userToEdit ? "Update User" : "Create User"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
