import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash, normalize } from "@/lib/security";

function clean(v: unknown) {
  return normalize(String(v ?? "")).trim().replace(/\s+/g, " ");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const type = body.type === "PARENT" ? "PARENT" : "STUDENT";
    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const className = clean(body.className);
    const childFirstName = clean(body.childFirstName);
    const childLastName = clean(body.childLastName);
    const childClass = clean(body.childClass);
    const candidateId = clean(body.candidateId);
    const captcha = clean(body.captcha);
    const deviceId = clean(body.deviceId);

    if (!firstName || !lastName || !candidateId || !captcha) {
      return NextResponse.json(
        { message: "Заполните все обязательные поля." },
        { status: 400 }
      );
    }

    if (type === "STUDENT" && !className) {
      return NextResponse.json(
        { message: "Укажите класс." },
        { status: 400 }
      );
    }

    if (
      type === "PARENT" &&
      (!childFirstName || !childLastName || !childClass)
    ) {
      return NextResponse.json(
        { message: "Укажите данные ребёнка." },
        { status: 400 }
      );
    }

    if (!deviceId) {
      return NextResponse.json(
        { message: "Не удалось определить устройство. Обновите страницу и попробуйте снова." },
        { status: 400 }
      );
    }

    // Cloudflare Turnstile
    if (process.env.TURNSTILE_SECRET_KEY) {
      const form = new URLSearchParams();

      form.set("secret", process.env.TURNSTILE_SECRET_KEY);
      form.set("response", captcha);

      const check = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form,
        }
      );

      const result = await check.json();

  if (!result.success) {
  console.log("TURNSTILE RESULT:", result);

  return NextResponse.json(
    { message: "CAPTCHA не пройдена. Попробуйте ещё раз." },
    { status: 403 }
  );
}  

    } else if (captcha.length < 4) {
      return NextResponse.json(
        { message: "Введите CAPTCHA." },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        isActive: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { message: "Выбранный класс недоступен." },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const ua = req.headers.get("user-agent") || "unknown";

    const ipHash = hash(ip);

    const identitySource = [
      type,
      firstName.toLocaleLowerCase(),
      lastName.toLocaleLowerCase(),
      className.toLocaleLowerCase(),
      childFirstName.toLocaleLowerCase(),
      childLastName.toLocaleLowerCase(),
      childClass.toLocaleLowerCase(),
    ].join("|");

    const identityHash = hash(identitySource);

    // Проверяем, голосовало ли уже это устройство
    const deviceHash = hash(deviceId);

    const recentFromIp = await prisma.vote.count({
      where: {
        ipHash,
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000),
        },
      },
    });

    const duplicateIdentity = await prisma.voter.findFirst({
      where: {
        identityHash,
      },
    });

    const duplicateDevice = await prisma.voter.findFirst({
      where: {
        deviceId: deviceHash,
      },
    });

    if (duplicateDevice) {
      return NextResponse.json(
        { message: "С этого устройства голос уже был отправлен." },
        { status: 409 }
      );
    }

    if (recentFromIp >= 8) {
      return NextResponse.json(
        {
          message:
            "Слишком много попыток с одного подключения. Попробуйте позже.",
        },
        { status: 429 }
      );
    }

    if (duplicateIdentity) {
      return NextResponse.json(
        { message: "Голос с такими данными уже зарегистрирован." },
        { status: 409 }
      );
    }

    const suspicious = recentFromIp >= 3;

    const suspiciousReason = suspicious
      ? "Несколько голосов с одного подключения за короткое время"
      : null;

    await prisma.$transaction(async (tx) => {
      const voter = await tx.voter.create({
        data: {
          type,
          firstName,
          lastName,
          className: className || null,
          childFirstName: childFirstName || null,
          childLastName: childLastName || null,
          childClass: childClass || null,
          identityHash,
          deviceId: deviceHash,
        },
      });

      await tx.vote.create({
        data: {
          voterId: voter.id,
          candidateId,
          ipHash,
          userAgentHash: hash(ua),
          suspicious,
          suspiciousReason,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "VOTE_CAST",
          actor: voter.id,
          metadata: {
            candidateId,
            type,
            suspicious,
            suspiciousReason,
          },
        },
      });
    });

    return NextResponse.json({
      message: "Голос принят. Спасибо за участие!",
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { message: "С этого устройства голос уже был отправлен." },
        { status: 409 }
      );
    }

    console.error(e);

    return NextResponse.json(
      { message: "Не удалось принять голос. Попробуйте ещё раз." },
      { status: 500 }
    );
  }
}
