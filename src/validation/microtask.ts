import { object, string, size, optional, date, boolean } from "superstruct";

export const MicroTaskCreationData = object({
  title: size(string(), 1, 100),
  description: optional(size(string(), 0, 500)),
});

export const MicroTaskUpdateData = object({
  title: size(string(), 1, 100),
  description: optional(size(string(), 0, 500)),
  isCompleted: boolean(),
});