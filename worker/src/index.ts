const E7_BASE = "https://e7api.onstove.com/gameApi";
const E7_HEADERS = {
  "Caller-Id": "WEB_STOVE_EPIC7",
  "Caller-Detail": "48217b2f-ab51-4415-8eeb-507df15baf82",
  "Content-Type": "application/x-www-form-urlencoded",
};

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request: Request, env: { ALLOWED_ORIGIN?: string }): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN ?? "*";
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    // /api/e7/<endpoint> 형태로 받음
    // e.g. /api/e7/getSeasonList?lang=ko
    const match = url.pathname.match(/^\/api\/e7\/(.+)/);
    if (!match) {
      return new Response("Not found", { status: 404 });
    }

    const endpoint = match[1];
    const e7Url = `${E7_BASE}/${endpoint}${url.search}`;

    try {
      const body = request.method === "POST" ? await request.text() : undefined;

      const res = await fetch(e7Url, {
        method: "POST",
        headers: E7_HEADERS,
        body: body ?? "",
      });

      const data = await res.text();

      return new Response(data, {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Proxy error", detail: String(err) }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
  },
};
