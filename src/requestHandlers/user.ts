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
    await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: await hash(req.body.password, saltRounds),
      },
      omit: { password: true },
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      throw new BadDataError(`${err.meta?.target} not unique`);
    }
    throw err;
  }
};

export const login = async (req: Request, res: Response) => {
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
    const jwtToken = sign(user.id.toString(), process.env.JWT_SECRET);

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({ message: "Login successful" });
  } else {
    throw new NotFoundError("Invalid email or password");
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
}

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
    getToken: (req) => {
      if (req.cookies?.token) {
        return req.cookies.token;
      }
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice("Bearer ".length);
      }
      return null;
    },
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