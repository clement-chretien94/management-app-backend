import { prisma } from "../db";
import { Request, Response } from "express";
import { Request as AuthRequest } from "express-jwt";
import { NotFoundError } from "../error";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";
import { assert } from "superstruct";
import { CategoryCreationData, CategoryUpdateData } from "../validation/category";

export const getCategories = async (req: AuthRequest, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.auth?.id },
  });
  res.json(categories);
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  assert(req.body, CategoryCreationData);
  try {
    const category = await prisma.category.create({
      data: {
        title: req.body.title,
        color: req.body.color,
        user: { connect: { id: req.auth?.id } },
      },
    });
    res.status(201);
    res.json(category);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  assert(req.body, CategoryUpdateData);
  try {
    const category = await prisma.category.update({
      where: { id: req.params.category_id as string, userId: req.auth?.id },
      data: {
        title: req.body.title,
        color: req.body.color,
      },
    });
    res.json(category);
  } catch (err) {
    console.log(err);
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
        throw new NotFoundError("Category not found");
    }
    throw err;
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.category.delete({
            where: { id: req.params.category_id as string, userId: req.auth?.id },
        });
        res.status(204).send();
    } catch (err) {
        console.log(err);
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
            throw new NotFoundError("Category not found");
        }
        throw err;
    }
};