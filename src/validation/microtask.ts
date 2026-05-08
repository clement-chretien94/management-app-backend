import { object, string, size, optional, date, boolean } from "superstruct";

export const MicroTaskCreationData = object({
  title: size(string(), 1, 100),
});

export const MicroTaskUpdateData = object({
  title: size(string(), 1, 100),
  isCompleted: boolean(),
});