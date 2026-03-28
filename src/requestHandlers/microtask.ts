import { prisma } from "../db";
import { Request, Response } from "express";
import { Request as AuthRequest } from "express-jwt";
import { NotFoundError } from "../error";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";
import { assert } from "superstruct";
import { MicroTaskCreationData, MicroTaskUpdateData } from "../validation/microtask";

export const getMicroTasks = async (req: AuthRequest, res: Response) => {
  const microTasks = await prisma.microTask.findMany({
    where: { userId: req.auth?.id },
  });
  res.json(microTasks);
};

export const createMicroTask = async (req: AuthRequest, res: Response) => {
  assert(req.body, MicroTaskCreationData);
  try {
    const microTask = await prisma.microTask.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        user: { connect: { id: req.auth?.id } },
      },
    });
    res.status(201);
    res.json(microTask);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const updateMicroTask = async (req: AuthRequest, res: Response) => {
  assert(req.body, MicroTaskUpdateData);
  try {
    const microTask = await prisma.microTask.update({
      where: { id: req.params.microtask_id as string, userId: req.auth?.id },
      data: {
        title: req.body.title,
        description: req.body.description,
        isCompleted: req.body.isCompleted,
      },
    });
    res.json(microTask);
  } catch (err) {
    console.log(err);
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundError("Micro task not found");
    }
    throw err;
  }
};

export const deleteMicroTask = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.microTask.delete({
            where: { id: req.params.microtask_id as string, userId: req.auth?.id },
        });
        res.status(204).send();
    } catch (err) {
        console.log(err);
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
            throw new NotFoundError("Micro task not found");
        }
        throw err;
    }
};