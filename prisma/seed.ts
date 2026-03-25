import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../src/generated/prisma/client';
import { hash } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({adapter});

async function main() {
  await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: await hash("password123", 12),
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
