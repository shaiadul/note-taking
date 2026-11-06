"use server";

import { revalidatePath } from "next/cache";
import { fetcher, fetcherWithAuth } from "@/lib/fetcher";
import { ApiResponse, Post } from "@/lib/types";
import { PostFormValues } from "@/lib/schemas";

export async function getPostsAction(page: number = 1, limit: number = 6) {
  try {
    const res = await fetcher<ApiResponse<Post[]>>("/posts", {
      params: { page, limit }
    });
    return res || { success: false, data: [], message: "Failed to fetch posts", pagination: undefined };
  } catch (error: any) {
    return { success: false, data: [], message: error.message || "Failed to fetch posts", pagination: undefined };
  }
}

export async function createPostAction(data: PostFormValues) {
  try {
    const res = await fetcherWithAuth<ApiResponse<Post>>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
      throwOnError: true
    });
    revalidatePath("/posts");
    return { success: true, data: res?.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create post" };
  }
}

export async function deletePostAction(id: string) {
  try {
    await fetcherWithAuth(`/posts/${id}`, {
      method: "DELETE",
      throwOnError: true
    });
    revalidatePath("/posts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete post" };
  }
}

export async function getUserPostsAction(userId: string) {
  try {
    const res = await fetcher<ApiResponse<Post[]>>(`/aggregations/user/${userId}/posts`, {
      throwOnError: true
    });
    return { success: true, data: res?.data || [] };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to retrieve user posts" };
  }
}
