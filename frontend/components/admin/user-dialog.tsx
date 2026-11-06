"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userEditFormSchema, UserEditFormValues } from "@/lib/schemas";
import { createUserAction, updateUserAction } from "@/actions/user.actions";
import { User } from "@/lib/types";
import { useEffect, useState, useTransition } from "react";
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
      <div className="relative w-full max-w-md rounded-2xl border border-muted bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-muted">
          <h2 className="text-base font-bold text-primary">
            {userToEdit ? "Edit User Account" : "Create New User"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="my-3 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Full Name</label>
            <input
              type="text"
              {...register("name")}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-muted bg-secondary/30 py-2 px-3 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && <p className="mt-1 text-[11px] text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Email Address</label>
            <input
              type="email"
              {...register("email")}
              placeholder="jane@example.com"
              className="w-full rounded-lg border border-muted bg-secondary/30 py-2 px-3 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.email && <p className="mt-1 text-[11px] text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">
              Password {userToEdit && <span className="font-normal text-muted-foreground">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="w-full rounded-lg border border-muted bg-secondary/30 py-2 px-3 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.password && (
              <p className="mt-1 text-[11px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Role</label>
              <select
                {...register("role")}
                className="w-full rounded-lg border border-muted bg-secondary/30 py-2 px-2.5 text-xs text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1">
                Interests <span className="font-normal text-muted-foreground">(csv)</span>
              </label>
              <input
                type="text"
                {...register("interests")}
                placeholder="chess, reading"
                className="w-full rounded-lg border border-muted bg-secondary/30 py-2 px-2.5 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-muted">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-muted px-4 py-2 text-xs font-medium text-primary hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-xs"
            >
              {isPending && <IconLoader2 className="h-3.5 w-3.5 animate-spin" />}
              {userToEdit ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

