import { NextRequest, NextResponse } from "next/server";
import { callScript } from "../_appsScript";

export async function GET(req: NextRequest) {
  try {
    const periodo = new URL(req.url).searchParams.get("periodo") ?? "semana";
    const data = await callScript("getEstatisticas", { periodo });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
