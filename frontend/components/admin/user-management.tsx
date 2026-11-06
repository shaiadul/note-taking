"use client";

import { Pagination, User } from "@/lib/types";
import { UserDialog } from "./user-dialog";
import { deleteUserAction } from "@/actions/user.actions";
import { PaginationControls } from "../pagination-controls";
import { SearchFilter } from "../search-filter";
import { useState, useTransition } from "react";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconShield,
  IconUserCheck
} from "@tabler/icons-react";
import { format } from "date-fns";

interface UserManagementProps {
  initialUsers: User[];
  pagination?: Pagination;
  searchQuery?: string;
}

export function UserManagement({
  initialUsers,
  pagination,
  searchQuery = ""
}: UserManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleCreate = () => {
    setUserToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }

    startDeleteTransition(async () => {
      await deleteUserAction(id);
      setDeletingId(null);
    });
  };

  const filteredUsers = searchQuery
    ? initialUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.interests?.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : initialUsers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <IconShield className="h-6 w-6 text-amber-500" />
            User Management
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            View, add, update roles, modify interests, or remove user accounts across the system.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
        >
          <IconPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchFilter placeholder="Filter users by name, email, or interest..." />
      </div>

      <div className="overflow-hidden rounded-xl border border-muted bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-muted bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Interests</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/60 text-xs text-primary">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-primary">{user.name}</div>
                      <div className="text-[11px] text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-secondary text-muted-foreground border border-muted"
                        }`}
                      >
                        {user.role === "admin" && <IconShield className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.interests && user.interests.length > 0 ? (
                          user.interests.map((interest, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] text-primary"
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-muted-foreground">
                      {user.createdAt
                        ? format(new Date(user.createdAt), "MMM d, yyyy")
                        : "N/A"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                          title="Edit user"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user._id)}
                          disabled={isDeleting && deletingId === user._id}
                          onMouseLeave={() => {
                            if (deletingId === user._id) setDeletingId(null);
                          }}
                          className={`rounded-md p-1.5 transition-colors ${
                            deletingId === user._id
                              ? "bg-destructive text-destructive-foreground text-[10px] px-2"
                              : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          }`}
                          title={
                            deletingId === user._id
                              ? "Click again to confirm delete"
                              : "Delete user"
                          }
                        >
                          {isDeleting && deletingId === user._id ? (
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                          ) : deletingId === user._id ? (
                            "Confirm?"
                          ) : (
                            <IconTrash className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls pagination={pagination} />
      </div>

      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userToEdit={userToEdit}
      />
    </div>
  );
}

