import { object, string, size, boolean, refine } from "superstruct";
import { isISO8601 } from "validator";

export const TimeBlockCreationData = object({
  title: size(string(), 1, 100),
  startTime: refine(string(), "date", (value) => isISO8601(value)),
  endTime: refine(string(), "date", (value) => isISO8601(value)),
});

export const TimeBlockUpdateData = object({
  title: size(string(), 1, 100),
  startTime: refine(string(), "date", (value) => isISO8601(value)),
  endTime: refine(string(), "date", (value) => isISO8601(value)),
  isLocked: boolean(),
});