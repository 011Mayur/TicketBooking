import { z } from "zod";
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$/;
const today = new Date();
today.setHours(0, 0, 0, 0);

const minimumBirthDate = new Date(today);
minimumBirthDate.setFullYear(minimumBirthDate.getFullYear() - 16);
export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email"),
    mobileNumber: z
      .string()
      .min(1, "Mobile number is required")
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine(
        (value) => {
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);
          return selectedDate < minimumBirthDate;
        },
        {
          message: "You must be at least 16 years old.",
        },
      ),
    gender: z.enum(["Male", "Female"], {
      message: "Please select a valid gender.",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(15, "Password must not exceed 15 characters")
      .regex(
        passwordRegex,
        "Password must include uppercase, lowercase, digit, and special character",
      ),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
