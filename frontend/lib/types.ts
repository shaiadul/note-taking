export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  userId: string;
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface InterestsGroupResult {
  _id: string;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  totalUsers: number;
}

export interface UserWithPostsResult {
  _id: string;
  name: string;
  email: string;
  role: string;
  interests: string[];
  posts: Array<{
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

