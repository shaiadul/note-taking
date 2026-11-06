"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postFormSchema, PostFormValues } from "@/lib/schemas";
import { createPostAction } from "@/actions/post.actions";
import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconX, IconLoader2 } from "@tabler/icons-react";

interface PostDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PostDialog({ isOpen, onClose }: PostDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: ""
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: PostFormValues) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createPostAction(data);
      if (!result.success) {
        setErrorMessage(result.error || "Failed to publish post");
        return;
      }
      reset();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
      <Card className="relative w-full max-w-lg border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150 p-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-border">
          <CardTitle className="text-base font-bold text-foreground">
            Publish Public Post
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
          <CardContent className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Post Title</label>
              <Input
                type="text"
                {...register("title")}
                placeholder="Database architecture, tech discussion..."
                className="h-9 text-xs"
              />
              {errors.title && (
                <p className="text-[11px] text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Content</label>
              <Textarea
                {...register("content")}
                rows={6}
                placeholder="Share your technical findings with everyone..."
                className="text-xs resize-none"
              />
              {errors.content && (
                <p className="text-[11px] text-destructive">{errors.content.message}</p>
              )}
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
              Publish Post
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
