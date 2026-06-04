import { prisma } from "../db";
import { Request, Response } from "express";
import { Request as AuthRequest } from "express-jwt";
import { NotFoundError } from "../error";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";
import { assert } from "superstruct";
import { TimeBlockCreationData, TimeBlockUpdateData } from "../validation/timeblock";

export const getTimeBlocks = async (req: AuthRequest, res: Response) => {
  const timeBlocks = await prisma.timeBlock.findMany({
    where: { userId: req.auth?.id },
  });
  res.json(timeBlocks);
};

export const createTimeBlock = async (req: AuthRequest, res: Response) => {
  assert(req.body, TimeBlockCreationData);
  try {
    const timeBlock = await prisma.timeBlock.create({
      data: {
        title: req.body.title,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        user: { connect: { id: req.auth?.id } },
      },
    });
    res.status(201);
    res.json(timeBlock);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const updateTimeBlock = async (req: AuthRequest, res: Response) => {
  assert(req.body, TimeBlockUpdateData);
  try {
    const timeBlock = await prisma.timeBlock.update({
      where: { id: req.params.timeblock_id as string, userId: req.auth?.id },
      data: {
        title: req.body.title,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        isLocked: req.body.isLocked,
      },
    });
    res.json(timeBlock);
  } catch (err) {
    console.log(err);
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundError("Time block not found");
    }
    throw err;
  }
};

export const lockTomorrowTimeBlocks = async (req: AuthRequest, res: Response) => {
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  try {
    await prisma.timeBlock.updateMany({
      where: {
        userId: req.auth?.id,
        startTime: { gte: tomorrowStart, lt: tomorrowEnd },
      },
      data: { isLocked: true },
    });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deleteTimeBlock = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.timeBlock.delete({
      where: { id: req.params.timeblock_id as string, userId: req.auth?.id },
    });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      throw new NotFoundError("Time block not found");
    }
    throw err;
  }
};