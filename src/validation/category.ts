import { object, string, size, refine } from "superstruct";
import { isHexColor } from "validator";

export const CategoryCreationData = object({
  title: size(string(), 1, 100),
  color: refine(string(), "int", (value) => isHexColor(value)),
});

export const CategoryUpdateData = object({
  title: size(string(), 1, 100),
  color: refine(string(), "int", (value) => isHexColor(value)),
});