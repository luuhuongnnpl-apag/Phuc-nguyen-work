const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra }
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const allowed = env.APP_ORIGIN;
    const cors = {
      "access-control-allow-origin": allowed,
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers": "Content-Type,Authorization",
      "vary": "Origin"
    };
    if (origin && origin !== allowed) return json({ error: "origin_not_allowed" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ status: "ok", service: "phuc-nguyen-work-api", database: Boolean(env.DB) }, 200, cors);
    }
    return json({ error: "not_implemented", message: "API nghiệp vụ chỉ mở sau khi cấu hình xác thực và migration D1." }, 501, cors);
  }
};
