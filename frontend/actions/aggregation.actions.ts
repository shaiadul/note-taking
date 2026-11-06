"use server";

import { fetcher } from "@/lib/fetcher";
import { ApiResponse, InterestsGroupResult, Post, UserWithPostsResult } from "@/lib/types";

export async function getInterestsGroupAction() {
  try {
    const res = await fetcher<ApiResponse<InterestsGroupResult[]>>(
      "/aggregations/group-by-interests",
      { throwOnError: true }
    );
    return { success: true, data: res?.data || [] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message || "Failed to load interest groups" };
  }
}

export async function getUserPostsLookupAction(userId: string) {
  try {
    const res = await fetcher<ApiResponse<Post[]>>(`/aggregations/user/${userId}/posts`, {
      throwOnError: true
    });
    return { success: true, data: res?.data || [] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message || "Failed to load posts" };
  }
}

export async function getUserProfileWithPostsAction(userId: string) {
  try {
    const res = await fetcher<ApiResponse<UserWithPostsResult>>(
      `/aggregations/user/${userId}/profile-with-posts`,
      { throwOnError: true }
    );
    return { success: true, data: res?.data || null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message || "Failed to load user profile" };
  }
}

