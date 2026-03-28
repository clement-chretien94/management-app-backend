import "dotenv/config";
import express, { Request, Response, NextFunction }  from "express";
import cors from "cors";
import { HttpError } from "./error";
import { assert, object, optional, string, StructError } from 'superstruct';

import * as user from "./requestHandlers/user";
import * as timeblock from "./requestHandlers/timeblock";
import * as microtask from "./requestHandlers/microtask";

const app = express();
const port = 3000;

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Expose-Headers", "X-Total-Count");
  next();
});

const ReqParams = object({
  timeblock_id: optional(string()),
  microtask_id: optional(string()),
});

const validateParams = (req: Request, res: Response, next: NextFunction) => {
  assert(req.params, ReqParams);
  next();
};

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the management app backend!');
});

// User routes
app.post("/signup", user.signup);
app.post("/signin", user.signin);

app.get("/user", user.auth_client, user.getConnectedUser);

// Time block routes
app.route("/timeblocks")
  .all(user.auth_client)
  .get(timeblock.getTimeBlocks)
  .post(timeblock.createTimeBlock);

app.route("/timeblocks/:timeblock_id")
  .all(user.auth_client)
  .all(validateParams)
  .put(timeblock.updateTimeBlock)
  .delete(timeblock.deleteTimeBlock);

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
