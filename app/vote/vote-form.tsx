"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

type VoterType = "STUDENT" | "PARENT";

export function VoteForm() {
  const [type, setType] = useState<VoterType>("STUDENT");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [className, setClassName] = useState("");
  const [childFirstName, setChildFirstName] = useState("");
  const [childLastName, setChildLastName] = useState("");
  const [childClass, setChildClass] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

   async function continueToVote(e: any) {
  e.preventDefault();

  let deviceId = localStorage.getItem("vote-device-id");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("vote-device-id", deviceId);
  }

  if (!captcha) {
    setMessage("Пожалуйста, пройдите CAPTCHA.");
    return;
  }

    setMessage("");
    setLoading(true);

    sessionStorage.setItem(
      "voterData",
     JSON.stringify({
       type,
       firstName,
       lastName,
       className,
       childFirstName,
       childLastName,
       childClass,
       captcha,
       deviceId,
      })
    );

    window.location.href = "/vote/choose";
  }

  return (
    <form onSubmit={continueToVote} className="card vote-card">
      <div className="segmented">
        <button
          type="button"
          className={type === "STUDENT" ? "active" : ""}
          onClick={() => setType("STUDENT")}
        >
          Я ученик
        </button>

        <button
          type="button"
          className={type === "PARENT" ? "active" : ""}
          onClick={() => setType("PARENT")}
        >
          Я родитель
        </button>
      </div>

      <div className="grid2">
        <div className="field">
          <label>{type === "PARENT" ? "Имя родителя" : "Имя"}</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="field">
          <label>{type === "PARENT" ? "Фамилия родителя" : "Фамилия"}</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      {type === "STUDENT" ? (
        <div className="field">
          <label>Класс</label>
          <input
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Например, 8А"
          />
        </div>
      ) : (
        <>
          <div className="section-title">Данные ребёнка</div>

          <div className="grid2">
            <div className="field">
              <label>Имя ребёнка</label>
              <input
                required
                value={childFirstName}
                onChange={(e) => setChildFirstName(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Фамилия ребёнка</label>
              <input
                required
                value={childLastName}
                onChange={(e) => setChildLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Класс ребёнка</label>
            <input
              required
              value={childClass}
              onChange={(e) => setChildClass(e.target.value)}
              placeholder="Например, 8А"
            />
          </div>
        </>
      )}

      <div className="section-title">Проверка CAPTCHA</div>

      <div style={{ margin: "16px 0" }}>
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
          onSuccess={(token) => setCaptcha(token)}
          onExpire={() => setCaptcha("")}
          onError={() => {
            setCaptcha("");
            setMessage("Не удалось загрузить CAPTCHA.");
          }}
        />
      </div>

      {message && <div className="notice danger">{message}</div>}

      <button className="btn" disabled={loading || !captcha}>
        {loading ? "Переходим…" : "Продолжить"}
      </button>
    </form>
  );
}