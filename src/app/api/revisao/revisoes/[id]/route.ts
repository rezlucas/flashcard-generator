import { NextRequest, NextResponse } from "next/server";
import { callScript } from "../../../_appsScript";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();
    const scriptAction = action === "adiar" ? "adiarRevisao" : "adiantarRevisao";
    const data = await callScript(scriptAction, { id });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
