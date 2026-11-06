"use server";

import { revalidatePath } from "next/cache";
import { fetcherWithAuth } from "@/lib/fetcher";
import { ApiResponse, User } from "@/lib/types";
import { UserEditFormValues } from "@/lib/schemas";

export async function getUsersAction(page: number = 1, limit: number = 10) {
  try {
    const res = await fetcherWithAuth<ApiResponse<User[]>>("/users", {
      params: { page, limit }
    });
    return res || { success: false, data: [], message: "Failed to fetch users", pagination: undefined };
  } catch (error: any) {
    return { success: false, data: [], message: error.message || "Failed to fetch users", pagination: undefined };
  }
}

export async function createUserAction(data: UserEditFormValues) {
  try {
    const interests = data.interests
      ? data.interests
          .split(",")
          .map((i) => i.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password || "defaultPass123",
      role: data.role,
      interests
    };

    const res = await fetcherWithAuth<ApiResponse<User>>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
      throwOnError: true
    });

    revalidatePath("/admin");
    return { success: true, data: res?.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create user" };
  }
}

export async function updateUserAction(id: string, data: UserEditFormValues) {
  try {
    const interests = data.interests
      ? data.interests
          .split(",")
          .map((i) => i.trim().toLowerCase())
          .filter(Boolean)
      : undefined;

    const payload: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      role: data.role,
      ...(interests !== undefined ? { interests } : {})
    };

    if (data.password && data.password.trim().length > 0) {
      payload.password = data.password;
    }

    const res = await fetcherWithAuth<ApiResponse<User>>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      throwOnError: true
    });

    revalidatePath("/admin");
    return { success: true, data: res?.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update user" };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await fetcherWithAuth(`/users/${id}`, {
      method: "DELETE",
      throwOnError: true
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete user" };
  }
}
