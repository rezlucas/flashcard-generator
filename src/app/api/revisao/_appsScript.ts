export async function callScript<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) {
    throw new Error(
      "APPS_SCRIPT_URL não configurada. Adicione ao .env.local e reinicie o servidor."
    );
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, ...payload }),
    redirect: "follow",
  });
  const json = (await res.json()) as { ok: boolean; data?: T; error?: string };
  if (!json.ok) throw new Error(json.error ?? "Erro no Apps Script");
  return json.data as T;
}
