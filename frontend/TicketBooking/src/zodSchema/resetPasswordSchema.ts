import { z } from "zod";
import { MESSAGES } from "../constants";
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$/;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH)
      .max(15, MESSAGES.VALIDATION.PASSWORD_MAX_LENGTH)
      .regex(
        passwordRegex,
        "Password must include uppercase, lowercase, digit, and special character",
      ),
    confirmPassword: z.string().min(1, MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: MESSAGES.VALIDATION.PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
