import { prisma } from "../db";
import { Request, Response } from "express";
import { NotFoundError, BadDataError } from "../error";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";
import { assert } from "superstruct";
import { UserCreationData, UserConnectData } from "../validation/user";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { NextFunction } from "express";
import { expressjwt, Request as AuthRequest } from "express-jwt";

const saltRounds = 12;

export const signup = async (req: Request, res: Response) => {
  assert(req.body, UserCreationData);
  try {
    const user = await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: await hash(req.body.password, saltRounds),
      },
      omit: { password: true },
    });
    res.json(user);
    res.status(201);
  } catch (err) {
    console.log(err);
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      throw new BadDataError(`${err.meta?.target} not unique`);
    }
    throw err;
  }
};

export const signin = async (req: Request, res: Response) => {
  assert(req.body, UserConnectData);
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (user && (await compare(req.body.password, user.password))) {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const jwt = sign(user.id.toString(), process.env.JWT_SECRET);
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, jwt });
    // console.log("JWT:", jwt);
    res.status(201);
  } else {
    throw new NotFoundError("Invalid email or password");
  }
};

export const getConnectedUser = async (req: AuthRequest, res: Response) => {
  if (req.auth) {
    const { password, ...userWithoutPassword } = req.auth;
    res.json(userWithoutPassword);
    res.status(200);
  } else {
    throw new NotFoundError("User not found");
  }
};

export const auth_client = [
  expressjwt({
    secret: process.env.JWT_SECRET as string,
    algorithms: ["HS256"],
  }),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth as unknown as string },
    });
    if (user) {
      req.auth = user;
      next();
    } else {
      res.status(401).send("Invalid token");
    }
  },
];