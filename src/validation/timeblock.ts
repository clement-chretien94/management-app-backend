import { object, string, size, boolean, refine, optional } from "superstruct";
import { isISO8601 } from "validator";

export const TimeBlockCreationData = object({
  title: size(string(), 1, 100),
  startTime: refine(string(), "date", (value) => isISO8601(value)),
  endTime: refine(string(), "date", (value) => isISO8601(value)),
  categoryId: optional(string()),
});

export const TimeBlockUpdateData = object({
  title: size(string(), 1, 100),
  startTime: refine(string(), "date", (value) => isISO8601(value)),
  endTime: refine(string(), "date", (value) => isISO8601(value)),
  categoryId: optional(string()),
  isLocked: boolean(),
});