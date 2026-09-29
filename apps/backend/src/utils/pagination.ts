// cursor-based and offset pagination helpers

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function parsePagination(query: { cursor?: string; limit?: string }): PaginationParams {
  return {
    cursor: query.cursor || undefined,
    limit: Math.min(Number(query.limit) || 20, 100),
  };
}
