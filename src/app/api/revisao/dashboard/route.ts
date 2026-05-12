import { NextResponse } from "next/server";
import { callScript } from "../_appsScript";

export async function GET() {
  try {
    const data = await callScript("getResumoHoje");
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
