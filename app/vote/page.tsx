import { VoteForm } from "./vote-form";

export const dynamic = "force-dynamic";

export default function VotePage() {
  return (
    <main className="container narrow">
      <div className="hero">
        <div className="emoji">🏆</div>
        <h1>Выберите победителя в конкурсе</h1>
        <p>«Наша школа самая — лучшая, потому что…»</p>
      </div>

      <VoteForm />
    </main>
  );
}