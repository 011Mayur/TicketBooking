import type { EventSortColumn, SortDir } from "../types";

export interface SortOption {
  field: EventSortColumn;
  direction: SortDir;
}

export const buildSortParams = (sorts: SortOption[]) => {
  if (!sorts.length) return {};

  if (sorts.length === 0) return {};

  const first = sorts[0];
  return {
    sortBy: first.field,
    sortDir: first.direction,
  };
};
