import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: {
        className: "asc",
      },
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Не удалось загрузить классы." },
      { status: 500 }
    );
  }
}