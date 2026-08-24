import { useEffect, useState } from "react";
import type { EventTypeDetail } from "../Common/interface";
import { homeService } from "../Services/homeService";

export function useEventTypes() {
  const [types, setTypes] = useState<EventTypeDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    homeService
      .getEventTypes()
      .then((data) => mounted && setTypes(data))
      .catch((err) => console.error("Failed to load event types", err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { types, loading };
}
