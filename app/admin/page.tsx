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
    orderBy: {
      createdAt: "desc",
    },
    include: {
      voter: true,
      candidate: true,
    },
  });

  // Группируем голоса по классам
  const classes = new Map<string, typeof recent>();

  for (const vote of recent) {
    const className =
      vote.voter.type === "STUDENT"
        ? vote.voter.className || "Без класса"
        : vote.voter.childClass || "Без класса";

    if (!classes.has(className)) {
      classes.set(className, []);
    }

    classes.get(className)!.push(vote);
  }

  // Сортируем классы
  const sortedClasses = Array.from(classes.entries()).sort(([a], [b]) =>
    a.localeCompare(b, "ru")
  );

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

      {/* Общая статистика */}
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

      {/* Классы */}
      <section style={{ marginTop: 24 }}>
        <h2>Голоса по классам</h2>

        {sortedClasses.length === 0 ? (
          <div className="card">
            <p className="muted">Пока никто не проголосовал.</p>
          </div>
        ) : (
          sortedClasses.map(([className, classVotes]) => (
            <section
              key={className}
              className="card"
              style={{ marginTop: 20 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div>
                  <span className="badge">КЛАСС</span>
                  <h2 style={{ margin: "8px 0 0" }}>{className}</h2>
                </div>

                <strong>
                  Голосов: {classVotes.length}
                </strong>
              </div>

              <div className="tablewrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Время</th>
                      <th>Голосующий</th>
                      <th>Тип</th>
                      <th>Ребёнок</th>
                      <th>Кандидат</th>
                      <th>Статус</th>
                    </tr>
                  </thead>

                  <tbody>
                    {classVotes.map((vote) => (
                      <tr key={vote.id}>
                        <td>
                          {vote.createdAt.toLocaleString("ru-RU")}
                        </td>

                        <td>
                          {vote.voter.firstName}{" "}
                          {vote.voter.lastName}
                        </td>

                        <td>
                          {vote.voter.type === "STUDENT"
                            ? "Ученик"
                            : "Родитель"}
                        </td>

                        <td>
                          {vote.voter.type === "PARENT"
                            ? `${vote.voter.childFirstName || ""} ${
                                vote.voter.childLastName || ""
                              }`
                            : "—"}
                        </td>

                        <td>
                          {vote.candidate.name}{" "}
                          {vote.candidate.surname}
                        </td>

                        <td>
                          {vote.suspicious ? (
                            <span className="flag">
                              ⚠️{" "}
                              {vote.suspiciousReason ||
                                "Проверить"}
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
          ))
        )}
      </section>
    </main>
  );
}