"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { fetcher, fetcherWithAuth } from "@/lib/fetcher";
import { ApiResponse, User } from "@/lib/types";
import { LoginFormValues, RegisterFormValues } from "@/lib/schemas";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

interface AuthResponseData {
  user: User;
  token: string;
}

export async function loginAction(data: LoginFormValues) {
  try {
    const res = await fetcher<ApiResponse<AuthResponseData>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      throwOnError: true
    });

    if (res?.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, res.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
      });
      revalidatePath("/", "layout");
      return { success: true, user: res.data.user };
    }

    return { success: false, error: "Failed to authenticate" };
  } catch (error: any) {
    return { success: false, error: error.message || "Login failed" };
  }
}

export async function registerAction(data: RegisterFormValues) {
  try {
    const interestsArray = data.interests
      ? data.interests
          .split(",")
          .map((i) => i.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      interests: interestsArray
    };

    const res = await fetcher<ApiResponse<AuthResponseData>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      throwOnError: true
    });

    if (res?.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, res.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
      });
      revalidatePath("/", "layout");
      return { success: true, user: res.data.user };
    }

    return { success: false, error: "Registration failed" };
  } catch (error: any) {
    return { success: false, error: error.message || "Registration failed" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete("token");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getCurrentUserAction(): Promise<User | null> {
  try {
    const res = await fetcherWithAuth<ApiResponse<User>>("/auth/me");
    return res?.data || null;
  } catch {
    return null;
  }
}

