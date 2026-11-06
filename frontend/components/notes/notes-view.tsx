"use client";

import { Note, Pagination, User } from "@/lib/types";
import { NoteCard } from "./note-card";
import { NoteDialog } from "./note-dialog";
import { PaginationControls } from "../pagination-controls";
import { SearchFilter } from "../search-filter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconPlus, IconNote } from "@tabler/icons-react";

interface NotesViewProps {
  initialNotes: Note[];
  pagination?: Pagination;
  user: User;
  searchQuery?: string;
}

export function NotesView({
  initialNotes,
  pagination,
  user,
  searchQuery = ""
}: NotesViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  const handleCreate = () => {
    setNoteToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (note: Note) => {
    setNoteToEdit(note);
    setIsDialogOpen(true);
  };

  const filteredNotes = searchQuery
    ? initialNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : initialNotes;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {user.role === "admin" ? "Platform Notes" : "My Encrypted Notes"}
            </h1>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? "Admin View (All Users)" : "User Access"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {user.role === "admin"
              ? "As an Admin, you can review and manage notes across all registered accounts."
              : "Create, view, and organize your private secure notes with end-to-end access control."}
          </p>
        </div>

        <Button
          onClick={handleCreate}
          size="sm"
          className="self-start sm:self-auto gap-1.5 shadow-xs"
        >
          <IconPlus className="h-4 w-4" />
          Create Note
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchFilter placeholder="Search notes by title or content..." />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
            <IconNote className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-foreground">No notes found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery
              ? `No notes match "${searchQuery}". Try a different keyword.`
              : "You haven't written any notes yet. Create your first note now!"}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleCreate}
              variant="secondary"
              size="sm"
              className="mt-4 gap-1.5"
            >
              <IconPlus className="h-4 w-4" />
              Write First Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note._id} note={note} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <PaginationControls pagination={pagination} />

      <NoteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        noteToEdit={noteToEdit}
      />
    </div>
  );
}
