import "dotenv/config";
import express, { Request, Response, NextFunction, Router }  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { HttpError } from "./error";
import { assert, object, optional, string, StructError } from 'superstruct';

import * as user from "./requestHandlers/user";
import * as timeblock from "./requestHandlers/timeblock";
import * as microtask from "./requestHandlers/microtask";
import * as category from "./requestHandlers/category";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["X-Total-Count"],
  })
);

app.use(cookieParser());

const ReqParams = object({
  timeblock_id: optional(string()),
  microtask_id: optional(string()),
  category_id: optional(string()),
});

const validateParams = (req: Request, res: Response, next: NextFunction) => {
  assert(req.params, ReqParams);
  next();
};

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the management app backend!');
});

// Auth routes
const authRouter = Router();
authRouter.post("/signup", user.signup);
authRouter.post("/login", user.login);
authRouter.post("/logout", user.logout);
app.use("/auth", authRouter);

// User routes
const userRouter = Router();
userRouter.get("/me", user.auth_client, user.getConnectedUser);
app.use("/users", userRouter);

// Time block routes
app.route("/timeblocks")
  .all(user.auth_client)
  .get(timeblock.getTimeBlocks)
  .post(timeblock.createTimeBlock);

app.route("/timeblocks/lock")
  .all(user.auth_client)
  .put(timeblock.lockTomorrowTimeBlocks);

app.route("/timeblocks/:timeblock_id")
  .all(user.auth_client)
  .all(validateParams)
  .put(timeblock.updateTimeBlock)
  .delete(timeblock.deleteTimeBlock);

// Category routes
app.route("/categories")
  .all(user.auth_client)
  .get(category.getCategories)
  .post(category.createCategory);

app.route("/categories/:category_id")
  .all(user.auth_client)
  .all(validateParams)
  .get(category.getCategory)
  .put(category.updateCategory)
  .delete(category.deleteCategory);

// Micro task routes
app.route("/microtasks")
  .all(user.auth_client)
  .get(microtask.getMicroTasks)
  .post(microtask.createMicroTask);

app.route("/microtasks/:microtask_id")
  .all(user.auth_client)
  .all(validateParams)
  .put(microtask.updateMicroTask)
  .delete(microtask.deleteMicroTask);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof StructError) {
    err.status = 400;
    err.message = `Bad value for field ${err.key}`;
  }
  res.status(err.status ?? 500).send(err.message);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
