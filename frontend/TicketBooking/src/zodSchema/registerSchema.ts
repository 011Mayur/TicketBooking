import { z } from "zod";
import { MESSAGES } from "../constants";
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$/;
const today = new Date();
today.setHours(0, 0, 0, 0);

const minimumBirthDate = new Date(today);
minimumBirthDate.setFullYear(minimumBirthDate.getFullYear() - 16);
export const registerSchema = z
  .object({
    firstName: z.string().min(1, MESSAGES.VALIDATION.FIRST_NAME_REQUIRED),
    lastName: z.string().min(1, MESSAGES.VALIDATION.LAST_NAME_REQUIRED),
    email: z.email("Invalid email"),
    mobileNumber: z
      .string()
      .min(1, MESSAGES.VALIDATION.MOBILE_REQUIRED)
      .regex(/^[6-9]\d{9}$/, MESSAGES.VALIDATION.MOBILE_INVALID),
    dateOfBirth: z
      .string()
      .min(1, MESSAGES.VALIDATION.DOB_REQUIRED)
      .refine(
        (value) => {
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);
          return selectedDate < minimumBirthDate;
        },
        {
          message: MESSAGES.VALIDATION.MIN_AGE,
        },
      ),
    gender: z.enum(["Male", "Female"], {
      message: MESSAGES.VALIDATION.INVALID_GENDER,
    }),
    password: z
      .string()
      .min(8, MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH)
      .max(15, MESSAGES.VALIDATION.PASSWORD_MAX_LENGTH)
      .regex(
        passwordRegex,
        "Password must include uppercase, lowercase, digit, and special character",
      ),
    confirmPassword: z.string().min(1, MESSAGES.VALIDATION.CONFIRM_PASSWORD_REQUIRED),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: MESSAGES.VALIDATION.PASSWORD_MISMATCH,
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
