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
    enableBulkDiscount: z.boolean().optional(),

    bulkTicketForDiscount: z
      .union([z.coerce.number(), z.literal("")])
      .optional(),
    discountPercentage: z.union([z.coerce.number(), z.literal("")]).optional(),
    eventCategoryId: z.coerce
      .number({ error: "Please select an event category" })
      .int()
      .positive("Please select an event category"),
    description: z
      .string()
      .min(1, "discription is required")
      .max(300, "discription Must Not Exceed 300 Characters"),
  })
  .superRefine((data, ctx) => {


    if (data.enableBulkDiscount) {
      if (
        !data.bulkTicketForDiscount ||
        Number(data.bulkTicketForDiscount) < 1
      ) {
        ctx.addIssue({
          path: ["bulkTicketForDiscount"],
          code: z.ZodIssueCode.custom,
          message: "Ticket Count must be greater than 0",
        });
      }
      if (!data.discountPercentage || Number(data.discountPercentage) < 1) {
        ctx.addIssue({
          path: ["discountPercentage"],
          code: z.ZodIssueCode.custom,
          message: "Discount Percentage must be greater than 0",
        });
      }
    }
  });

export type EventFormValues = z.infer<typeof eventSchema>;
