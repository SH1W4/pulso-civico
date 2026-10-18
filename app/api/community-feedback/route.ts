import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import {
  COMMUNITY_FEEDBACK_SURVEYS,
  isCommunityFeedbackSurvey,
  isValidFeedbackOption,
} from "@/lib/community-feedback";

export const runtime = "nodejs";
const COOKIE_NAME = "pc_feedback_participant";
const MINIMUM_PUBLISHABLE_RESPONSES = 10;

function isEnabled(): boolean {
  return process.env.COMMUNITY_FEEDBACK_ENABLED === "true";
}

function participantHash(token: string): string {
  const secret = process.env.PARTICIPANT_TOKEN_SECRET;
  if (!secret) throw new Error("PARTICIPANT_TOKEN_SECRET is not configured");
  return createHmac("sha256", secret).update(token).digest("hex");
}

export async function GET(request: NextRequest) {
  if (!isEnabled()) {
    return NextResponse.json({ error: "Os resultados estão temporariamente indisponíveis." }, { status: 503 });
  }

  const survey = request.nextUrl.searchParams.get("survey");
  if (!isCommunityFeedbackSurvey(survey)) {
    return NextResponse.json({ error: "Consulta inválida." }, { status: 400 });
  }

  try {
    const result = await getPool().query<{ option_key: string; count: string; total: string }>(
      "SELECT option_key, COUNT(*)::text AS count, SUM(COUNT(*)) OVER ()::text AS total " +
      "FROM community_feedback_responses WHERE survey_key = $1 GROUP BY option_key ORDER BY option_key",
      [survey],
    );
    const total = result.rows.length ? Number(result.rows[0].total) : 0;
    const publishable = total >= MINIMUM_PUBLISHABLE_RESPONSES;

    return NextResponse.json({
      survey,
      title: COMMUNITY_FEEDBACK_SURVEYS[survey].title,
      status: publishable ? "published" : "insufficient_responses",
      totalResponses: publishable ? total : null,
      minimumResponsesToPublish: MINIMUM_PUBLISHABLE_RESPONSES,
      updatedAt: new Date().toISOString(),
      results: publishable
        ? COMMUNITY_FEEDBACK_SURVEYS[survey].options.map((option) => ({
            key: option.key,
            label: option.label,
            count: Number(result.rows.find((row) => row.option_key === option.key)?.count ?? 0),
          }))
        : [],
      methodology: "Consulta voluntária e autoselecionada; os resultados não representam automaticamente o eleitorado.",
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar os resultados." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isEnabled()) {
    return NextResponse.json({ error: "A participação está temporariamente indisponível." }, { status: 503 });
  }

  const expectedNoticeVersion = process.env.COMMUNITY_FEEDBACK_PRIVACY_NOTICE_VERSION;
  const tokenSecret = process.env.PARTICIPANT_TOKEN_SECRET;
  if (!expectedNoticeVersion || !tokenSecret) {
    return NextResponse.json({ error: "A participação ainda não foi configurada para uso público." }, { status: 503 });
  }

  const participantToken = request.cookies.get(COOKIE_NAME)?.value;
  if (!participantToken) {
    return NextResponse.json({ error: "Inicie a participação e aceite o aviso de privacidade." }, { status: 428 });
  }

  let body: { survey?: unknown; option?: unknown; privacyNoticeVersion?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }

  if (
    body.privacyNoticeVersion !== expectedNoticeVersion ||
    !isCommunityFeedbackSurvey(body.survey) ||
    !isValidFeedbackOption(body.survey, body.option)
  ) {
    return NextResponse.json({ error: "Resposta inválida ou aviso de privacidade desatualizado." }, { status: 400 });
  }

  try {
    await getPool().query(
      "INSERT INTO community_feedback_responses " +
      "(survey_key, option_key, participant_hash, privacy_notice_version) VALUES ($1, $2, $3, $4)",
      [body.survey, body.option, participantHash(participantToken), expectedNoticeVersion],
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "Esta consulta já foi respondida neste navegador." }, { status: 409 });
    }
    return NextResponse.json({ error: "Não foi possível registrar a resposta." }, { status: 503 });
  }
}
