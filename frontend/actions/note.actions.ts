"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "@/lib/fetcher";
import { ApiResponse, Note } from "@/lib/types";
import { NoteFormValues } from "@/lib/schemas";

export async function getNotesAction(page: number = 1, limit: number = 6) {
  try {
    const res = await fetcherWithAuth<ApiResponse<Note[]>>("/notes", {
      params: { page, limit }
    });
    return res || { success: false, data: [], message: "Failed to fetch notes", pagination: undefined };
  } catch (error: any) {
    return { success: false, data: [], message: error.message || "Failed to fetch notes", pagination: undefined };
  }
}

export async function getNoteByIdAction(id: string) {
  try {
    const res = await fetcherWithAuth<ApiResponse<Note>>(`/notes/${id}`, {
      throwOnError: true
    });
    return { success: true, data: res?.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to retrieve note" };
  }
}

export async function createNoteAction(data: NoteFormValues) {
  try {
    const res = await fetcherWithAuth<ApiResponse<Note>>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
      throwOnError: true
    });
    revalidatePath("/");
    return { success: true, data: res?.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create note" };
  }
}

export async function updateNoteAction(id: string, data: NoteFormValues) {
  try {
    const res = await fetcherWithAuth<ApiResponse<Note>>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      throwOnError: true
    });
    revalidatePath("/");
    return { success: true, data: res?.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update note" };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    await fetcherWithAuth(`/notes/${id}`, {
      method: "DELETE",
      throwOnError: true
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete note" };
  }
}
