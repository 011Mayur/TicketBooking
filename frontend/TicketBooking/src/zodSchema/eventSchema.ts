import { z } from "zod";
import { MESSAGES } from "../constants";
const today = new Date();
today.setHours(0, 0, 0, 0);
export const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, MESSAGES.VALIDATION.TITLE_REQUIRED)
      .max(200, MESSAGES.VALIDATION.TITLE_MAX_LENGTH),
    artistName: z
      .string()
      .min(1, MESSAGES.VALIDATION.ARTIST_REQUIRED)
      .max(50, MESSAGES.VALIDATION.ARTIST_MAX_LENGTH),
    venue: z
      .string()
      .min(1, MESSAGES.VALIDATION.VENUE_REQUIRED)
      .max(200, MESSAGES.VALIDATION.VENUE_MAX_LENGTH),
    eventDate: z
      .string()
      .min(1, MESSAGES.VALIDATION.EVENT_DATE_REQUIRED)
      .refine(
        (value) => {
          const selectedDate = new Date(value);
          selectedDate.setHours(0, 0, 0, 0);
          return selectedDate > today;
        },
        {
          message: MESSAGES.VALIDATION.EVENT_DATE_FUTURE,
        },
      ),
    eventTime: z
      .string()
      .min(1, MESSAGES.VALIDATION.EVENT_TIME_REQUIRED)
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, MESSAGES.VALIDATION.EVENT_TIME_INVALID),
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
      .min(1, MESSAGES.VALIDATION.DESCRIPTION_REQUIRED)
      .max(300, MESSAGES.VALIDATION.DESCRIPTION_MAX_LENGTH),
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
          message: MESSAGES.VALIDATION.TICKET_COUNT_GT_ZERO,
        });
      }
      if (!data.discountPercentage || Number(data.discountPercentage) < 1) {
        ctx.addIssue({
          path: ["discountPercentage"],
          code: z.ZodIssueCode.custom,
          message: MESSAGES.VALIDATION.DISCOUNT_GT_ZERO,
        });
      }
    }
  });

export type EventFormValues = z.infer<typeof eventSchema>;
