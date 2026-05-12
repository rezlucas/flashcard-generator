import { NextRequest, NextResponse } from "next/server";
import { callScript } from "../_appsScript";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await callScript("listSessoes", {
      materiaId: searchParams.get("materiaId") || undefined,
      tipo:      searchParams.get("tipo")      || undefined,
      de:        searchParams.get("de")        || undefined,
      ate:       searchParams.get("ate")       || undefined,
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await callScript("createSessao", body);
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
