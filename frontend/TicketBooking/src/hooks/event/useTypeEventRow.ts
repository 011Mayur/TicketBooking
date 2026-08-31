import { useCallback, useEffect, useState } from "react";
import type { HomePageEvent } from "../../types";
import { homeService } from "../../services/homeService";

export function useTypeEventRow(typeId: number | null) {
  const [events, setEvents] = useState<HomePageEvent[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      if (typeId === null) return;
      if (targetPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const result = await homeService.getEvents(targetPage, typeId);
        setEvents((prev) => (append ? [...prev, ...result.data] : result.data));
        setHasNextPage(result.hasNextPage);
        setPage(targetPage);
      } catch (err) {
        console.error(`Failed to load events for type ${typeId}`, err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [typeId],
  );

  useEffect(() => {
    if (typeId === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(1, false);
  }, [typeId,fetchPage]);

  const loadMore = () => {
    if (loadingMore || !hasNextPage) return;
    fetchPage(page + 1, true);
  };

  const isEmpty = !loading && events.length === 0;

  return { events, loading, loadingMore, hasNextPage, isEmpty, loadMore };
}
