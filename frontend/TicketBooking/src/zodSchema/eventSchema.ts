import { z } from "zod";
const today = new Date();
today.setHours(0, 0, 0, 0);
export const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "title must be under 200 Characters"),
    artistName: z
      .string()
      .min(1, "Artist name is required")
      .max(50, "Artist Name Must Not Exceed 50 Characters"),
    venue: z
      .string()
      .min(1, "Venue is required")
      .max(200, "Venue must be under 200 Characters"),
    eventDate: z
      .string()
      .min(1, "Event date is required")
      .refine(
        (value) => {
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);
          return selectedDate > today;
        },
        {
          message: "Event date must be in future",
        },
      ),
    eventTime: z
      .string()
      .min(1, "Event time is required")
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Enter a valid time"),
    ticketPrice: z.coerce
      .number({ error: "Ticket price must be a number" })
      .positive("Ticket price must be greater than 0"),
    totalSeats: z.coerce
      .number({ error: "Ticket price must be a number" })
      .int()
      .positive("Total seats must be at least 1"),

    bulkTicketForDiscount: z.coerce
      .number()
      .int()
      .positive("Ticket Count Must be greter than 0")
      .optional(),
    discountPercentage: z.coerce
      .number()
      .positive("Discount Must be greter than 0")
      .max(100, "Percentage must be between 0 and 100")
      .optional(),
   
  })
  .superRefine((data, ctx) => {
    const hasTicket = data.bulkTicketForDiscount !== undefined;
    const hasDiscount = data.discountPercentage !== undefined;

    if (hasTicket !== hasDiscount) {
      if (!hasTicket) {
        ctx.addIssue({
          code: "custom",
          path: ["bulkTicketForDiscount"],
          message: "Required when discount is enabled",
        });
      }

      if (!hasDiscount) {
        ctx.addIssue({
          code: "custom",
          path: ["discountPercentage"],
          message: "Required when discount is enabled",
        });
      }
    }
  });

export type EventFormValues = z.infer<typeof eventSchema>;
