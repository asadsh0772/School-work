import { prisma } from "@/lib/prisma";
import { VoteForm } from "./vote-form";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const candidates = await prisma.candidate.findMany({where:{isActive:true},orderBy:{createdAt:"asc"},select:{id:true,name:true,surname:true,className:true}});
  return <main className="container narrow">
    <div className="hero"><div className="emoji">🏆</div><h1>Выберите победителя в конкурсе</h1><p>«Наша школа самая — лучшая, потому что…»</p></div>
    <VoteForm candidates={candidates}/>
  </main>;
}
