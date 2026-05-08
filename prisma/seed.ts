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

async function main() {
  await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: await hash("password123", 12),
      timeBlocks: {
        create: [
          {
            title: "Deep work",
            startTime: atTime(0, 8, 0),
            endTime: atTime(0, 10, 30),
          },
          {
            title: "Lunch",
            startTime: atTime(0, 12, 0),
            endTime: atTime(0, 13, 0),
          },
          {
            title: "Client follow-up",
            startTime: atTime(0, 14, 0),
            endTime: atTime(0, 14, 45),
            isLocked: true,
          },
          {
            title: "Meeting with team",
            startTime: atTime(0, 15, 0),
            endTime: atTime(0, 16, 0),
          },
          {
            title: "Planning",
            startTime: atTime(1, 9, 0),
            endTime: atTime(1, 11, 0),
          },
        ],
      },
      microTasks: {
        create: [
          {
            title: "Email cleanup",
          },
          {
            title: "Project planning",
          },
          {
            title: "Standup notes",
          },
          {
            title: "Update tickets",
          },
          {
            title: "Prepare demo",
          },
          {
            title: "Sync with design",
            isCompleted: true,
          },
          {
            title: "Backup files",
          },
        ],
      },
    }
  });
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
