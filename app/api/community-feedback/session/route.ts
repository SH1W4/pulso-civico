import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const COOKIE_NAME = "pc_feedback_participant";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export async function POST(request: NextRequest) {
  if (process.env.COMMUNITY_FEEDBACK_ENABLED !== "true") {
    return NextResponse.json({ error: "A participação está temporariamente indisponível." }, { status: 503 });
  }

  const expectedNoticeVersion = process.env.COMMUNITY_FEEDBACK_PRIVACY_NOTICE_VERSION;
  if (!expectedNoticeVersion) {
    return NextResponse.json({ error: "A versão do aviso de privacidade não foi configurada." }, { status: 503 });
  }

  let body: { accepted?: unknown; privacyNoticeVersion?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }

  if (body.accepted !== true || body.privacyNoticeVersion !== expectedNoticeVersion) {
    return NextResponse.json({ error: "É necessário aceitar o aviso de privacidade vigente." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, privacyNoticeVersion: expectedNoticeVersion });
  response.cookies.set(COOKIE_NAME, randomUUID(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}
