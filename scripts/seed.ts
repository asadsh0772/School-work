import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const secret = process.env.VOTE_SECRET || "development-secret";
const hash = (s:string) => crypto.createHmac("sha256", secret).update(s).digest("hex");

async function main() {
  await prisma.vote.deleteMany();
  await prisma.votingToken.deleteMany();
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
    ["10Б", "10Б класс"]
  ];

  await prisma.candidate.createMany({
    data: candidates.map(([name, description]) => ({
      name,
      surname: "",
      description,
      isActive: true
    }))
  });

  const voter = await prisma.voter.create({
    data: {
      type: "STUDENT",
      firstName: "Тест",
      lastName: "Ученик",
      className: "9Б",
      verified: true
    }
  });

  await prisma.votingToken.create({
    data: {
      voterId: voter.id,
      tokenHash: hash("TEST2026"),
      expiresAt: new Date(Date.now() + 86400000)
    }
  });

  console.log("Созданы 9 классов-кандидатов.");
  console.log("Демо-код голосования: TEST2026");
}

main().finally(() => prisma.$disconnect());