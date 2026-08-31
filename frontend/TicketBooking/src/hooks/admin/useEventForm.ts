import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { API_ROUTES } from "../../constants/apiRoutes";
import { MESSAGES } from "../../constants/messages";
import type {
  ApiResponse,
  CouponCode,
  Event,
  EventCategory,
  EventTypeDetail,
} from "../../types";

interface UseEventFormOptions {
  mode: "add" | "edit";
  eventId?: number;
  typeId: number | null;
  categoryId: number | null;
}

export function useEventForm({
  mode,
  eventId,
  typeId,
  categoryId,
}: UseEventFormOptions) {
  const [selectedEventType, setSelectedEventType] =
    useState<EventTypeDetail | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(mode === "edit");
  const [eventData, setEventData] = useState<Event | null>(null);

  const hasFetchedRef = useRef(false);
  const prevTypeRef = useRef<EventTypeDetail | null>(null);

  // Fetch event types to find the matching one for this typeId
  useEffect(() => {
    if (!typeId) return;
    const fetchTypes = async () => {
      try {
        const res = await api.get<ApiResponse<EventTypeDetail[]>>(
          API_ROUTES.EVENT_MANAGEMENT.TYPES,
        );
        const matched = res.data.data.find((t) => t.id === typeId);
        if (matched) {
          setSelectedEventType(matched);
          prevTypeRef.current = matched;
        }
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
      }
    };
    fetchTypes();
  }, [typeId]);

  // Fetch categories whenever selected event type changes
  useEffect(() => {
    if (!selectedEventType) return;
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await api.get<ApiResponse<EventCategory[]>>(
          API_ROUTES.EVENT_MANAGEMENT.CATEGORIES_BY_TYPE_ID(
            selectedEventType.id,
          ),
        );
        setCategories(res.data.data);
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [selectedEventType]);

  // Fetch active coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      setCouponLoading(true);
      try {
        const res = await api.get<CouponCode[]>(
          API_ROUTES.COUPON.GET_ALL_ACTIVE,
        );
        setCoupons(res.data);
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_COUPONS);
      } finally {
        setCouponLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // Fetch event data in edit mode
  const fetchEvent = useCallback(async (): Promise<Event | null> => {
    if (mode !== "edit" || !eventId) return null;
    if (hasFetchedRef.current) return null;
    hasFetchedRef.current = true;

    try {
      const res = await api.get<ApiResponse<Event>>(
        API_ROUTES.EVENT.GET_BY_ID(eventId),
      );
      setEventData(res.data.data);
      return res.data.data;
    } catch (error) {
      console.error(error);
      toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mode, eventId]);

  useEffect(() => {
    if (mode === "edit" && eventId) {
      fetchEvent();
    } else {
      hasFetchedRef.current = false;
    }
  }, [mode, eventId, fetchEvent]);

  return {
    selectedEventType,
    categories,
    categoriesLoading,
    coupons,
    couponLoading,
    loading,
    eventData,
    categoryId,
  };
}
