import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .min(1, "Coupon code is required")
    .max(30, "Code must be 30 characters or fewer"),
  discountPercentage: z
    .number({ error: "Discount percentage must be a number" })
    .min(1, "Must be at least 1%")
    .max(100, "Cannot exceed 100%"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  isActive: z.boolean()
});

export type CouponFormValues = z.infer<typeof couponSchema>;
