import { z } from "zod";
import { MESSAGES } from "../constants";

export const couponSchema = z.object({
  code: z
    .string()
    .min(1, MESSAGES.VALIDATION.COUPON_CODE_REQUIRED)
    .max(30, MESSAGES.VALIDATION.COUPON_CODE_MAX_LENGTH),
  discountPercentage: z
    .number({ error: "Discount percentage must be a number" })
    .min(1, MESSAGES.VALIDATION.DISCOUNT_MIN)
    .max(100, MESSAGES.VALIDATION.DISCOUNT_MAX),
  expiryDate: z.string().min(1, MESSAGES.VALIDATION.EXPIRY_DATE_REQUIRED),
  isActive: z.boolean()
});

export type CouponFormValues = z.infer<typeof couponSchema>;
