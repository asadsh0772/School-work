import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.vote.deleteMany();
  await prisma.voter.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.auditLog.deleteMany();

  const candidates = [
    ["5А", "5А класс"],
    ["8А", "8А класс"],
    ["7Б", "7Б класс"],
    ["5Б", "5Б класс"],
    ["10Г", "10Г класс"],
    ["10А", "10А класс"],
    ["7А", "7А класс"],
    ["6А", "6А класс"],
    ["10Б", "10Б класс"],
  ];

  await prisma.candidate.createMany({
    data: candidates.map(([name, description]) => ({
      name,
      surname: "",
      description,
      isActive: true,
    })),
  });

 await prisma.voter.create({
  data: {
    type: "STUDENT",
    firstName: "Тест",
    lastName: "Ученик",
    className: "9Б",
    identityHash: "seed-test-identity",
  },
});

  console.log("Созданы 9 классов-кандидатов.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());