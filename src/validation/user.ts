import { object, string, size, refine } from "superstruct";
import { isEmail } from "validator";

export const UserCreationData = object({
  firstName: size(string(), 1, 80),
  lastName: size(string(), 1, 80),
  email: refine(string(), "int", (value) => isEmail(value)),
  password: size(string(), 8, 50),
});

export const UserConnectData = object({
  email: refine(string(), "int", (value) => isEmail(value)),
  password: size(string(), 8, 50),
});