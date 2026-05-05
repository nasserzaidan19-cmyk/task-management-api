import { PaginatedResponse, PaginationParams, QueryPrams } from "../types";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export function extractPaginationParams(query: QueryPrams): PaginationParams {
  const page = Math.max(
    1,
    parseInt(String(query.page || DEFAULT_PAGE), 10) || DEFAULT_PAGE,
  );

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      parseInt(String(query.limit || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
    ),
  );

  return { page, limit };
}

//Calculates pagination metadata

export function calculatePagination(
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

//Paginates an in-memory array

export function paginateArray<T>(
  items: T[],
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
): T[] {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return items.slice(startIndex, endIndex);
}

// RESPONSE WRAPPER

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
): PaginatedResponse<T> {
  return {
    data,
    pagination: calculatePagination(total, page, limit),
  };
}

// ============================================
// SORTING UTILITIES
// ============================================

export type SortOrder = "asc" | "desc";

export interface SortParams {
  sortBy?: string;
  order?: SortOrder;
}

export function extractSortParams(
  query: QueryPrams,
  allowedFields: string[],
  defaultSortBy: string = "createdAt",
): Required<SortParams> {
  const sortBy = String(query.sortBy || defaultSortBy);
  const order = (
    query.order?.toLowerCase() === "asc" ? "asc" : "desc"
  ) as SortOrder;
  const validatedSortBy = allowedFields.includes(sortBy)
    ? sortBy
    : defaultSortBy;

  return { sortBy: validatedSortBy, order };
}

// Generic array sorting function

export function sortArray<T extends Record<string, any>>(
  items: T[],
  sortBy: string,
  order: SortOrder,
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (aVal instanceof Date && bVal instanceof Date) {
      const comparison = aVal.getTime() - bVal.getTime();
      return order === "asc" ? comparison : -comparison;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
      return order === "asc" ? comparison : -comparison;
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      const comparison = aVal - bVal;
      return order === "asc" ? comparison : -comparison;
    }

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return order === "asc" ? comparison : -comparison;
  });
}
