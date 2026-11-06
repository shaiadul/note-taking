export interface IPaginationQuery {
  page?: number;
  limit?: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
