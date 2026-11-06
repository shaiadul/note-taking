"use client";

import { Pagination, User } from "@/lib/types";
import { UserDialog } from "./user-dialog";
import { deleteUserAction } from "@/actions/user.actions";
import { PaginationControls } from "../pagination-controls";
import { SearchFilter } from "../search-filter";
import { useState, useTransition } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconShield
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              User Management
            </h1>
            <Badge variant="default" className="gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20">
              <IconShield className="h-3 w-3" />
              Admin Only
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            View, add, update roles, modify interests, or remove user accounts across the system.
          </p>
        </div>

        <Button
          onClick={handleCreate}
          size="sm"
          className="self-start sm:self-auto gap-1.5 shadow-xs"
        >
          <IconPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchFilter placeholder="Filter users by name, email, or interest..." />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="py-3 px-4 text-xs font-semibold">User</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Role</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Interests</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold">Joined</TableHead>
              <TableHead className="py-3 px-4 text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                  No users found matching query.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3.5 px-4">
                    <div className="font-semibold text-foreground text-xs">{user.name}</div>
                    <div className="text-[11px] text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="text-[10px] uppercase font-bold"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {user.interests && user.interests.length > 0 ? (
                        user.interests.map((interest, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px] bg-secondary/50 font-normal"
                          >
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-[11px] text-muted-foreground">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleEdit(user)}
                        title="Edit user"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <IconEdit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant={deletingId === user._id ? "destructive" : "ghost"}
                        size="icon-xs"
                        onClick={() => handleDelete(user._id)}
                        disabled={isDeleting && deletingId === user._id}
                        onMouseLeave={() => {
                          if (deletingId === user._id) setDeletingId(null);
                        }}
                        title={
                          deletingId === user._id
                            ? "Click again to confirm delete"
                            : "Delete user"
                        }
                        className={deletingId === user._id ? "px-2 w-auto h-6 text-[10px]" : "text-muted-foreground hover:text-destructive"}
                      >
                        {isDeleting && deletingId === user._id ? (
                          <IconLoader2 className="h-3 w-3 animate-spin" />
                        ) : deletingId === user._id ? (
                          "Confirm?"
                        ) : (
                          <IconTrash className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
