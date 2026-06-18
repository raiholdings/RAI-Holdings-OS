/** Fetch URLs and extract plain text (naive HTML strip). Best-effort, capped. */
export async function parseFiles(urls: string[], maxChars = 6000): Promise<string> {
  const out: string[] = [];
  for (const url of urls.slice(0, 3)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      let text = await res.text();
      if (ct.includes("html")) {
        text = text
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
      out.push(`# ${url}\n${text.slice(0, maxChars)}`);
    } catch {
      /* skip unreachable */
    }
  }
  return out.join("\n\n");
}
