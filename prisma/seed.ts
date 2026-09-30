import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const classes = [
  "5А",
  "8А",
  "7Б",
  "5Б",
  "10Г",
  "10А",
  "7А",
  "6А",
  "10Б",
];

async function main() {
  for (const className of classes) {
    await prisma.candidate.create({
      data: {
        name: className,
        surname: "",
        className: className,
        isActive: true,
      },
    });
  }

  console.log("Классы добавлены!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });