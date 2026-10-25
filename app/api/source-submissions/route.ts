import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES = new Set([
  "Checagem de fatos",
  "Fonte oficial / dados públicos",
  "Jornalismo",
  "Ferramenta de verificação",
  "Pesquisa e universidade",
  "Outro recurso",
]);
const STATUSES = new Set(["APPROVED", "REJECTED", "NEEDS_REVIEW"]);
const MAX_URL_LENGTH = 2048;
const MAX_NOTE_LENGTH = 1000;

type SourceRow = {
  id: string;
  url: string;
  normalized_url: string;
  category: string;
  note: string | null;
  status: string;
  moderation_note: string | null;
  created_at: Date;
  updated_at: Date;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function normalizePublicUrl(raw: unknown): { url: string; normalized: string } | null {
  if (typeof raw !== "string" || raw.length > MAX_URL_LENGTH) return null;
  try {
    const parsed = new URL(raw.trim());
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
    if (parsed.username || parsed.password) return null;
    if (!parsed.hostname || parsed.hostname === "localhost" || parsed.hostname.endsWith(".localhost") ||
      parsed.hostname.endsWith(".local") || parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1" || /^10\./.test(parsed.hostname) ||
      /^192\.168\./.test(parsed.hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname) ||
      /^169\.254\./.test(parsed.hostname) || /^0\./.test(parsed.hostname)) return null;
    parsed.hash = "";
    const normalized = parsed.toString().replace(/\/$/, "");
    return { url: parsed.toString(), normalized };
  } catch {
    return null;
  }
}

function authorized(request: NextRequest): boolean {
  const expected = process.env.SOURCE_MODERATION_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied) return false;
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function publicSource(row: SourceRow) {
  return {
    id: row.id,
    url: row.url,
    category: row.category,
    description: row.note,
    status: row.status,
    submittedAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const includePending = request.nextUrl.searchParams.get("status") === "pending";
  if (includePending && !authorized(request)) return jsonError("Não autorizado.", 401);

  try {
    const result = includePending
      ? await getPool().query<SourceRow>(
          "SELECT id::text, url, normalized_url, category, note, status, moderation_note, created_at, updated_at FROM source_submissions WHERE status <> 'APPROVED' ORDER BY created_at DESC LIMIT 200",
        )
      : await getPool().query<SourceRow>(
          "SELECT id::text, url, normalized_url, category, note, status, moderation_note, created_at, updated_at FROM source_submissions WHERE status = 'APPROVED' ORDER BY updated_at DESC LIMIT 200",
        );
    return NextResponse.json({ sources: result.rows.map(publicSource) });
  } catch {
    return jsonError("Catálogo temporariamente indisponível.", 503);
  }
}

export async function POST(request: NextRequest) {
  let body: { url?: unknown; category?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("O corpo da solicitação precisa ser JSON válido.", 400);
  }

  const parsedUrl = normalizePublicUrl(body.url);
  if (!parsedUrl) return jsonError("Informe uma URL HTTP ou HTTPS válida e pública, sem credenciais.", 400);
  if (typeof body.category !== "string" || !CATEGORIES.has(body.category)) {
    return jsonError("Selecione uma categoria válida.", 400);
  }
  if (body.note !== undefined && body.note !== null &&
      (typeof body.note !== "string" || body.note.length > MAX_NOTE_LENGTH)) {
    return jsonError("A descrição deve ter no máximo 1.000 caracteres.", 400);
  }

  try {
    const result = await getPool().query<SourceRow>(
      "INSERT INTO source_submissions (url, normalized_url, category, note) VALUES ($1, $2, $3, $4) " +
      "ON CONFLICT (normalized_url) DO NOTHING " +
      "RETURNING id::text, url, normalized_url, category, note, status, moderation_note, created_at, updated_at",
      [parsedUrl.url, parsedUrl.normalized, body.category, typeof body.note === "string" ? body.note.trim() || null : null],
    );
    if (!result.rows.length) return jsonError("Esta URL já foi sugerida. A equipe poderá revisar a sugestão existente.", 409);
    return NextResponse.json({
      ok: true,
      source: { id: result.rows[0].id, status: result.rows[0].status, message: "Sugestão recebida e aguardando revisão." },
    }, { status: 201 });
  } catch {
    return jsonError("Não foi possível registrar a sugestão. Confira se o banco foi migrado e tente novamente.", 503);
  }
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return jsonError("Não autorizado.", 401);
  let body: { id?: unknown; status?: unknown; moderationNote?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("O corpo da solicitação precisa ser JSON válido.", 400);
  }
  if (typeof body.id !== "string" || !/^\d+$/.test(body.id) ||
      typeof body.status !== "string" || !STATUSES.has(body.status) ||
      (body.moderationNote !== undefined && (typeof body.moderationNote !== "string" || body.moderationNote.length > 1000))) {
    return jsonError("Identificador, estado ou nota de moderação inválidos.", 400);
  }

  const client = await getPool().connect().catch(() => null);
  if (!client) return jsonError("Banco de dados temporariamente indisponível.", 503);
  try {
    await client.query("BEGIN");
    const changed = await client.query<SourceRow>(
      "UPDATE source_submissions SET status = $2, moderation_note = $3, updated_at = NOW() WHERE id = $1 " +
      "RETURNING id::text, url, normalized_url, category, note, status, moderation_note, created_at, updated_at",
      [body.id, body.status, typeof body.moderationNote === "string" ? body.moderationNote.trim() || null : null],
    );
    if (!changed.rows.length) {
      await client.query("ROLLBACK");
      return jsonError("Sugestão não encontrada.", 404);
    }
    await client.query(
      "INSERT INTO source_moderation_events (source_id, status, moderation_note) VALUES ($1, $2, $3)",
      [body.id, body.status, typeof body.moderationNote === "string" ? body.moderationNote.trim() || null : null],
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, source: publicSource(changed.rows[0]) });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return jsonError("Não foi possível atualizar a moderação.", 503);
  } finally {
    client.release();
  }
}
