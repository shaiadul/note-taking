"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { noteFormSchema, NoteFormValues } from "@/lib/schemas";
import { createNoteAction, updateNoteAction } from "@/actions/note.actions";
import { Note } from "@/lib/types";
import { useEffect, useState, useTransition } from "react";
import { IconX, IconLoader2 } from "@tabler/icons-react";

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: Note | null;
}

export function NoteDialog({ isOpen, onClose, noteToEdit }: NoteDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: ""
    }
  });

  useEffect(() => {
    if (noteToEdit) {
      reset({
        title: noteToEdit.title,
        content: noteToEdit.content
      });
    } else {
      reset({
        title: "",
        content: ""
      });
    }
    setErrorMessage(null);
  }, [noteToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: NoteFormValues) => {
    setErrorMessage(null);
    startTransition(async () => {
      let result;
      if (noteToEdit) {
        result = await updateNoteAction(noteToEdit._id, data);
      } else {
        result = await createNoteAction(data);
      }

      if (!result.success) {
        setErrorMessage(result.error || "Failed to save note");
        return;
      }

      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-muted bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-muted">
          <h2 className="text-base font-bold text-primary">
            {noteToEdit ? "Edit Note" : "Create New Note"}
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
            <label className="block text-xs font-semibold text-primary mb-1">Title</label>
            <input
              type="text"
              {...register("title")}
              placeholder="Meeting Notes, Architectural Ideas..."
              className="w-full rounded-lg border border-muted bg-secondary/30 py-2 px-3 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Content</label>
            <textarea
              {...register("content")}
              rows={6}
              placeholder="Write your encrypted thoughts here..."
              className="w-full rounded-lg border border-muted bg-secondary/30 py-2 px-3 text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            {errors.content && (
              <p className="mt-1 text-[11px] text-destructive">{errors.content.message}</p>
            )}
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
              {noteToEdit ? "Update Note" : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

