"use client";

import { Note } from "@/lib/types";
import { deleteNoteAction } from "@/actions/note.actions";
import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash, IconLoader2, IconCalendar } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    startDeleteTransition(async () => {
      await deleteNoteAction(note._id);
    });
  };

  const formattedDate = note.createdAt
    ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
    : "recently";

  return (
    <Card className="group relative border-border/80 hover:border-primary/40 hover:shadow-sm transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-foreground line-clamp-1 pr-12">
          {note.title}
        </CardTitle>
        <CardAction className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(note)}
            title="Edit note"
            className="text-muted-foreground hover:text-foreground"
          >
            <IconEdit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={confirmDelete ? "destructive" : "ghost"}
            size="icon-xs"
            onClick={handleDelete}
            disabled={isDeleting}
            onMouseLeave={() => setConfirmDelete(false)}
            title={confirmDelete ? "Click again to confirm delete" : "Delete note"}
            className={confirmDelete ? "px-2 w-auto h-6 text-[10px]" : "text-muted-foreground hover:text-destructive"}
          >
            {isDeleting ? (
              <IconLoader2 className="h-3 w-3 animate-spin" />
            ) : confirmDelete ? (
              "Confirm?"
            ) : (
              <IconTrash className="h-3.5 w-3.5" />
            )}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-5 leading-relaxed font-normal">
          {note.content}
        </p>
      </CardContent>

      <CardFooter className="py-2.5 px-4 text-[11px] text-muted-foreground justify-between bg-muted/30">
        <span className="flex items-center gap-1 font-medium">
          <IconCalendar className="h-3 w-3" />
          {formattedDate}
        </span>
        {confirmDelete && (
          <span className="text-[10px] font-bold text-destructive animate-pulse">
            Confirm delete?
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
