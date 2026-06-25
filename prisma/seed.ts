import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../src/generated/prisma/client';
import { hash } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({adapter});

const baseDate = new Date();
baseDate.setHours(0, 0, 0, 0);

const atTime = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const createUser = async () => {
  return await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: await hash("password123", 12),
    }
  });
};

const createCategories = async (userId: string) => {
  const categories = [
    { title: "Code", color: "#432dd7" },
    { title: "Free Time", color: "#43d74a" },
    { title: "Work", color: "#d74343" },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        ...category,
        userId,
      }
    });
  }
};

const createTimeBlocks = async (userId: string) => {
  const timeBlocks = [
    {
      title: "Deep work",
      startTime: atTime(0, 8, 0),
      endTime: atTime(0, 10, 30),
      categoryId: await prisma.category.findUnique({ where: { title: "Code" } }).then(c => c?.id),
    },
    {
      title: "Lunch",
      startTime: atTime(0, 12, 0),
      endTime: atTime(0, 13, 0),
      categoryId: await prisma.category.findUnique({ where: { title: "Free Time" } }).then(c => c?.id),
    },
    {
      title: "Client follow-up",
      startTime: atTime(0, 14, 0),
      endTime: atTime(0, 14, 45),
      categoryId: await prisma.category.findUnique({ where: { title: "Work" } }).then(c => c?.id),
      isLocked: true,
    },
    {
      title: "Meeting with team",
      startTime: atTime(0, 15, 0),
      endTime: atTime(0, 16, 0),
      categoryId: await prisma.category.findUnique({ where: { title: "Work" } }).then(c => c?.id),
    },
    {
      title: "Planning",
      startTime: atTime(1, 9, 0),
      endTime: atTime(1, 11, 0),
      categoryId: await prisma.category.findUnique({ where: { title: "Work" } }).then(c => c?.id),
    },
  ];

  for (const block of timeBlocks) {
    await prisma.timeBlock.create({
      data: {
        ...block,
        userId,
      }
    });
  }
};

const createMicroTasks = async (userId: string) => {
  const microTasks = [
    { title: "Email cleanup" },
    { title: "Project planning" },
    { title: "Standup notes" },
    { title: "Update tickets" },
    { title: "Prepare demo" },
    { title: "Sync with design", isCompleted: true },
    { title: "Backup files" },
  ];

  for (const task of microTasks) {
    await prisma.microTask.create({
      data: {
        ...task,
        userId,
      }
    });
  }
};

async function main() {
  const user = await createUser();
  await createCategories(user.id);
  await createTimeBlocks(user.id);
  await createMicroTasks(user.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
