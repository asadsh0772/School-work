"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Неверный пароль");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section
        className="card"
        style={{
          maxWidth: "420px",
          margin: "80px auto",
          padding: "24px",
        }}
      >
        <h1>Вход в админ-панель</h1>

        <p className="muted">
          Введите пароль организатора.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "16px",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p className="flag">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
            }}
          >
            {loading ? "Проверяем..." : "Войти"}
          </button>
        </form>
      </section>
    </main>
  );
}