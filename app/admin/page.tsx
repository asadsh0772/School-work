import { isAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const [voters, votes, candidates, suspicious] = await Promise.all([
    prisma.voter.count(),
    prisma.vote.count(),
    prisma.candidate.count(),
    prisma.vote.count({
      where: { suspicious: true },
    }),
  ]);

  const recent = await prisma.vote.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      voter: true,
      candidate: true,
    },
  });

  return (
    <main className="container">
      <div className="topbar">
        <div>
          <span className="badge">ADMIN</span>
          <h1>Панель голосования</h1>
        </div>

        <span className="muted">
          Данные доступны только организаторам
        </span>
      </div>

      <div className="stats">
        <div className="card stat">
          <span className="muted">Голосов</span>
          <b>{votes}</b>
        </div>

        <div className="card stat">
          <span className="muted">Зарегистрировано</span>
          <b>{voters}</b>
        </div>

        <div className="card stat">
          <span className="muted">Кандидатов</span>
          <b>{candidates}</b>
        </div>

        <div className="card stat">
          <span className="muted">Подозрительных</span>
          <b>{suspicious}</b>
        </div>
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <h2>Последние голоса</h2>

        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>Время</th>
                <th>Тип</th>
                <th>Голосующий</th>
                <th>Класс</th>
                <th>Ребёнок</th>
                <th>Кандидат</th>
                <th>Статус</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((v) => (
                <tr key={v.id}>
                  <td>{v.createdAt.toLocaleString("ru-RU")}</td>

                  <td>
                    {v.voter.type === "STUDENT"
                      ? "Ученик"
                      : "Родитель"}
                  </td>

                  <td>
                    {v.voter.firstName} {v.voter.lastName}
                  </td>

                  <td>{v.voter.className || "—"}</td>

                  <td>
                    {v.voter.childFirstName
                      ? `${v.voter.childFirstName} ${
                          v.voter.childLastName || ""
                        } (${v.voter.childClass || "—"})`
                      : "—"}
                  </td>

                  <td>
                    {v.candidate.name} {v.candidate.surname}
                  </td>

                  <td>
                    {v.suspicious ? (
                      <span className="flag">
                        ⚠️ {v.suspiciousReason || "Проверить"}
                      </span>
                    ) : (
                      "✅"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}