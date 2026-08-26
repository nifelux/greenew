/*
 * Public configuration endpoint.
 * Never return SUPABASE_SERVICE_ROLE_KEY or any payment/provider secret here.
 */
function readFirst() {
  for (var i = 0; i < arguments.length; i += 1) {
    var value = String(arguments[i] || "").trim();
    if (value) return value;
  }
  return "";
}

function normaliseUrl(value) {
  var raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  try {
    var parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    return parsed.toString().replace(/\/+$/, "");
  } catch (error) {
    return "";
  }
}

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED", error: "Method not allowed" });

  var supabaseUrl = normaliseUrl(readFirst(
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.VITE_SUPABASE_URL
  ));
  var supabaseAnon = readFirst(
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  if (!supabaseUrl || !supabaseAnon) {
    return res.status(503).json({
      ok: false,
      code: "CONFIG_MISSING",
      error: "Serlzo Investments public Supabase configuration is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel."
    });
  }

  return res.status(200).json({
    ok: true,
    code: "READY",
    supabaseUrl: supabaseUrl,
    supabaseAnon: supabaseAnon
  });
};
