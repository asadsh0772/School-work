"use client";

import { useEffect, useState } from "react";

type Candidate = {
  id: string;
  name: string;
  surname: string;
  className: string | null;
};

export default function ChoosePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data.candidates || []);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Не удалось загрузить список классов.");
        setLoading(false);
      });
  }, []);

  async function vote() {
    if (!selected) {
      setMessage("Выберите класс.");
      return;
    }

    const saved = sessionStorage.getItem("voterData");

    if (!saved) {
      window.location.href = "/vote";
      return;
    }

    const voterData = JSON.parse(saved);

    setVoting(true);
    setMessage("");

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...voterData,
        candidateId: selected,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      sessionStorage.removeItem("voterData");
      setMessage("Голос успешно принят!");
    } else {
      setMessage(data.message || "Не удалось принять голос.");
    }

    setVoting(false);
  }

  if (loading) {
    return (
      <main className="container narrow">
        <div className="card">
          <p>Загружаем классы...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container narrow">
      <div className="hero">
        <div className="emoji">🏆</div>
        <h1>Выберите класс-победитель</h1>
        <p>За какой класс вы хотите проголосовать?</p>
      </div>

      <div className="card">
        <div className="candidate-grid">
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={
                selected === candidate.id
                  ? "candidate selected"
                  : "candidate"
              }
              onClick={() => setSelected(candidate.id)}
            >
              {candidate.className || candidate.name}
            </button>
          ))}
        </div>

        {message && (
          <div className="notice">
            {message}
          </div>
        )}

        <button
          className="btn"
          disabled={!selected || voting}
          onClick={vote}
        >
          {voting ? "Отправляем голос..." : "Проголосовать"}
        </button>
      </div>
    </main>
  );
}