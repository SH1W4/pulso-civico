import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Option = { id: string; label: string };
type CommunityPoll = { id: string; title: string; description: string; options: Option[] };

const POLLS: CommunityPoll[] = [
  {
    id: "prioridades",
    title: "O que você quer acompanhar primeiro?",
    description: "Consulta comunitária voluntária sobre as ferramentas do Observatório Eleitoral.",
    options: [
      { id: "evolucao", label: "Evolução das pesquisas" },
      { id: "institutos", label: "Comparar institutos" },
      { id: "territorio", label: "Meu estado no contexto nacional" },
      { id: "apuracao", label: "Apuração oficial" },
    ],
  },
  {
    id: "transparencia",
    title: "O que não pode faltar em uma pesquisa?",
    description: "Consulta comunitária voluntária sobre transparência metodológica.",
    options: [
      { id: "metodologia", label: "Metodologia acessível" },
      { id: "fonte", label: "Fonte verificável" },
      { id: "margem", label: "Margem de erro explicada" },
      { id: "historico", label: "Histórico de atualizações" },
    ],
  },
];

declare global {
  // Reuse the pool between serverless invocations in a warm Node.js process.
  // eslint-disable-next-line no-var
  var pulsoPgPool: Pool | undefined;
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurada.");
  if (!global.pulsoPgPool) {
    global.pulsoPgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return global.pulsoPgPool;
}

function voterHash(token: string): string {
  const secret = process.env.POLL_VOTER_HASH_SECRET;
  if (!secret || secret.length < 32) throw new Error("POLL_VOTER_HASH_SECRET precisa ter pelo menos 32 caracteres.");
  return createHmac("sha256", secret).update(token).digest("hex");
}

function safePoll(poll: CommunityPoll, results: Array<{ option_id: string; votes: string }>, total: number) {
  const publicResults = total >= 5;
  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    options: poll.options,
    total: publicResults ? total : null,
    resultsVisible: publicResults,
    results: publicResults ? poll.options.map((option) => {
      const found = results.find((result) => result.option_id === option.id);
      const votes = Number(found?.votes ?? 0);
      return { optionId: option.id, label: option.label, votes, percentage: total ? Math.round((votes / total) * 1000) / 10 : 0 };
    }) : [],
    minimumResponsesToPublish: 5,
  };
}

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT poll_id, option_id, COUNT(*)::int AS votes FROM community_poll_votes GROUP BY poll_id, option_id",
    );
    const totals = new Map<string, number>();
    for (const row of result.rows) totals.set(row.poll_id, (totals.get(row.poll_id) ?? 0) + Number(row.votes));
    const polls = POLLS.map((poll) => {
      const rows = result.rows.filter((row) => row.poll_id === poll.id);
      return safePoll(poll, rows, totals.get(poll.id) ?? 0);
    });
    return NextResponse.json({
      polls,
      updatedAt: new Date().toISOString(),
      notice: "Consulta voluntária e autoselecionada; os resultados não representam automaticamente o eleitorado brasileiro.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar resultados.";
    return NextResponse.json({ error: message }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { pollId?: unknown; optionId?: unknown; voterToken?: unknown; consent?: unknown };
    if (body.consent !== true) return NextResponse.json({ error: "É necessário confirmar que leu o aviso de privacidade." }, { status: 400 });
    if (typeof body.pollId !== "string" || typeof body.optionId !== "string") {
      return NextResponse.json({ error: "Consulta ou opção inválida." }, { status: 400 });
    }
    if (typeof body.voterToken !== "string" || body.voterToken.length < 20 || body.voterToken.length > 100) {
      return NextResponse.json({ error: "Identificador local inválido. Recarregue a página e tente novamente." }, { status: 400 });
    }
    const poll = POLLS.find((item) => item.id === body.pollId);
    if (!poll || !poll.options.some((option) => option.id === body.optionId)) {
      return NextResponse.json({ error: "Consulta ou opção não reconhecida." }, { status: 400 });
    }

    const pool = getPool();
    const hash = voterHash(body.voterToken);
    const inserted = await pool.query(
      "INSERT INTO community_poll_votes (id, poll_id, option_id, voter_hash) VALUES ($1, $2, $3, $4) ON CONFLICT (poll_id, voter_hash) DO NOTHING RETURNING id",
      [randomUUID(), poll.id, body.optionId, hash],
    );
    if (inserted.rowCount === 0) {
      return NextResponse.json({ error: "Este navegador já registrou uma resposta para esta consulta." }, { status: 409 });
    }
    return NextResponse.json({ accepted: true, pollId: poll.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível registrar a resposta.";
    return NextResponse.json({ error: message }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
