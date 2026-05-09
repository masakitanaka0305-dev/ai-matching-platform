export const dynamic = "force-dynamic";

async function probeBackend(url: string) {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
    const body = await res.text();
    return { status: res.status, body, ok: true };
  } catch (e: unknown) {
    return { status: 0, body: String(e), ok: false };
  }
}

export default async function DebugPage() {
  const apiUrl = process.env.API_URL || "(not set)";
  const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL || "(not set)";

  const probe = apiUrl !== "(not set)" ? await probeBackend(apiUrl) : null;

  return (
    <div style={{ padding: 40, fontFamily: "monospace", fontSize: 14 }}>
      <h1>Debug: API Connection</h1>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ padding: 8, border: "1px solid #ccc" }}>API_URL</td><td style={{ padding: 8, border: "1px solid #ccc" }}>{apiUrl}</td></tr>
          <tr><td style={{ padding: 8, border: "1px solid #ccc" }}>NEXT_PUBLIC_API_URL</td><td style={{ padding: 8, border: "1px solid #ccc" }}>{nextPublicApiUrl}</td></tr>
          <tr><td style={{ padding: 8, border: "1px solid #ccc" }}>Backend /health probe</td><td style={{ padding: 8, border: "1px solid #ccc" }}>{probe ? `${probe.ok ? "OK" : "FAIL"} - status=${probe.status} body=${probe.body}` : "skipped (no API_URL)"}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
