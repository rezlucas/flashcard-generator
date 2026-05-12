import { NextRequest, NextResponse } from "next/server";
import { callScript } from "../_appsScript";

export async function GET() {
  try {
    const data = await callScript("listMaterias");
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nome, paiId, cor } = await req.json();
    const data = await callScript("createMateria", { nome, paiId, cor });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
