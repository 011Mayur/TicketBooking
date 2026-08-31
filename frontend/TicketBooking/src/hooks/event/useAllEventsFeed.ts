import { useCallback, useEffect, useState } from "react";
import type { HomePageEvent } from "../../types";
import { homeService } from "../../services/homeService";

export function useAllEventsFeed() {
  const [events, setEvents] = useState<HomePageEvent[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      try {
        if (targetPage === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const result = isSearching
          ? await homeService.searchEvents(searchQuery.trim(), targetPage, null)
          : await homeService.getEvents(targetPage, null);

        setEvents((prev) => (append ? [...prev, ...result.data] : result.data));
        setHasNextPage(result.hasNextPage);
        setPage(targetPage);
      } catch (err) {
        setError(
          isSearching
            ? "Search failed. Please try again."
            : "Failed to load events. Please try again later.",
        );
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isSearching, searchQuery],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(1, false);
  }, [searchQuery, fetchPage]);

  const loadMore = () => {
    if (loadingMore || !hasNextPage) return;
    fetchPage(page + 1, true);
  };

  return {
    events,
    loading,
    loadingMore,
    error,
    hasNextPage,
    searchQuery,
    isSearching,
    handleSearchInput: setSearchQuery,
    handleSearchSubmit: () => fetchPage(1, false),
    loadMore,
  };
}
