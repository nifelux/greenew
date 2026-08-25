/* Public browser configuration for the Serlzo Investments portal.
 * Never return SUPABASE_SERVICE_ROLE_KEY or any payment/provider secret here.
 */
module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  var supabaseUrl = String(process.env.SUPABASE_URL || "").trim();
  var supabaseAnon = String(
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (!supabaseUrl || !supabaseAnon) {
    return res.status(503).json({
      ok: false,
      error: "Serlzo Investments public Supabase configuration is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel."
    });
  }

  return res.status(200).json({ ok: true, supabaseUrl: supabaseUrl, supabaseAnon: supabaseAnon });
};
