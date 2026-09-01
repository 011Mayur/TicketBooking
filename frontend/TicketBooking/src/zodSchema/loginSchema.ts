import { z } from "zod";
import { MESSAGES } from "../constants";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, MESSAGES.VALIDATION.PASSWORD_REQUIRED),
  role: z.enum(["Admin", "User"]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
