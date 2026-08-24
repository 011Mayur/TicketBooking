import { useState, useCallback, useEffect } from "react";
import type { CheckoutState, CouponValidation, PricingBreakdown } from "../Common/interface";
import { BookingDiscountType, type BookingDiscountTypeValue } from "../Common/types";



interface UseCheckoutProps {
  eventId: number;
  quantity: number;
  unitPrice: number;
  bulkTicketForDiscount?: number;
  bulkDiscountPercentage?: number;
  availableSeats: number;
}

export const useCheckout = ({
  eventId,
  quantity,
  unitPrice,
  bulkTicketForDiscount = 0,
  bulkDiscountPercentage = 0,

}: UseCheckoutProps) => {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    eventId,
    quantity,
    discountType: BookingDiscountType.None,
  });

  const [couponData, setCouponData] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Calculate if bulk discount is eligible
  const isBulkEligible = useCallback((): boolean => {
    return (
      quantity >= bulkTicketForDiscount &&
      bulkTicketForDiscount > 0 &&
      bulkDiscountPercentage > 0
    );
  }, [quantity, bulkTicketForDiscount, bulkDiscountPercentage]);

  // Apply coupon
  const applyCoupon = useCallback(
    (coupon: CouponValidation) => {
      setCouponData(coupon);
      setCouponError(null);

      // Coupon overrides bulk discount
      setCheckoutState((prev) => ({
        ...prev,
        discountType: BookingDiscountType.Coupon,
        couponCode: coupon.code,
      }));
    },
    []
  );

  // Remove coupon and apply bulk discount if eligible
  const removeCoupon = useCallback(() => {
    setCouponData(null);
    setCouponError(null);

    // Apply bulk discount if eligible, otherwise no discount
    setCheckoutState((prev) => ({
      ...prev,
      discountType: isBulkEligible()
        ? BookingDiscountType.Bulk
        : BookingDiscountType.None,
      couponCode: undefined,
    }));
  }, [isBulkEligible]);

  // Set coupon error
  const setCouponErrorMsg = useCallback((error: string) => {
    setCouponError(error);
  }, []);

  // Calculate pricing breakdown
  const calculatePricing = useCallback((): PricingBreakdown => {
    const subTotal = unitPrice * quantity;
    let bulkDiscountAmount: number | undefined;
    let couponDiscountAmount: number | undefined;
    let finalAmount = subTotal;
    let discountType: BookingDiscountTypeValue = BookingDiscountType.None;

    // Apply coupon if present, otherwise check bulk discount
    if (couponData) {
      couponDiscountAmount = Math.round(
        (subTotal * couponData.discountPercentage) / 100 * 100
      ) / 100;
      finalAmount = subTotal - couponDiscountAmount;
      discountType = BookingDiscountType.Coupon;
    } else if (isBulkEligible()) {
      bulkDiscountAmount = Math.round(
        (subTotal * bulkDiscountPercentage) / 100 * 100
      ) / 100;
      finalAmount = subTotal - bulkDiscountAmount;
      discountType = BookingDiscountType.Bulk;
    }

    return {
      unitPrice,
      quantity,
      subTotal,
      bulkDiscountPercentage: isBulkEligible() ? bulkDiscountPercentage : undefined,
      bulkDiscountAmount,
      couponDiscountPercentage: couponData?.discountPercentage,
      couponDiscountAmount,
      finalAmount,
      discountType,
      bulkEligible: isBulkEligible(),
    };
  }, [unitPrice, quantity, bulkDiscountPercentage, couponData, isBulkEligible]);

  // Update checkout state when quantity or discounts change
  useEffect(() => {
    const pricing = calculatePricing();
    setCheckoutState((prev) => ({
      ...prev,
      quantity,
      discountType: pricing.discountType,
    }));
  }, [quantity, calculatePricing]);

  return {
    checkoutState,
    couponData,
    couponError,
    pricing: calculatePricing(),
    applyCoupon,
    removeCoupon,
    setCouponErrorMsg,
    isBulkEligible: isBulkEligible(),
  };
};