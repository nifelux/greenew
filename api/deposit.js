/**
 * /api/deposit.js — All deposit actions
 * GET  ?action=method             → active deposit method
 * GET  ?action=status&ref=XXX     → deposit status
 * POST ?action=initiate-manual    → create manual deposit
 * POST ?action=initiate-paystack  → create Paystack deposit
 */
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function genRef(prefix, uid) {
  return `${prefix}-${uid.replace(/-/g,"").slice(0,6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}
function genNarration(uid) {
  // No dashes — bank/PSP transfer description fields often strip or mangle
  // special characters, which broke matching against Gmail credit alerts.
  // Plain uppercase alphanumeric survives every bank's narration field intact.
  return `GRN${uid.replace(/-/g,"").slice(0,5).toUpperCase()}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

module.exports = async function(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();

  const { action } = req.query;

  // GET: method
  if(req.method==="GET" && action==="method") {
    const { data:rows,error } = await supabase.from("site_settings").select("key,value").in("key",["deposit_method","bank_name","account_name","account_number"]);
    if(error) return res.status(500).json({ error:error.message });
    const settings=Object.fromEntries((rows||[]).map(s=>[s.key,s.value]));
    return res.json({
      ok:true,
      method:settings.deposit_method || "manual",
      bank_name:settings.bank_name || "",
      account_name:settings.account_name || "",
      account_number:settings.account_number || ""
    });
  }

  // GET: status
  if(req.method==="GET" && action==="status") {
    const { ref } = req.query;
    if(!ref) return res.status(400).json({ error:"ref required" });
    const { data } = await supabase.from("deposits").select("status,amount,paid_at").eq("reference",ref).single();
    if(!data) return res.status(404).json({ error:"not found" });
    return res.json({ ok:true, ...data });
  }

  if(req.method!=="POST") return res.status(405).json({ error:"Method not allowed" });

  const { user_id, amount, email } = req.body;
  if(!user_id || !amount) return res.status(400).json({ error:"user_id and amount required" });
  const num = Number(amount);
  if(num < 500) return res.status(400).json({ error:"Minimum deposit is ₦500" });

  // POST: initiate-manual
  if(action==="initiate-manual") {
    const reference = genRef("MAN", user_id);
    const narration = genNarration(user_id);

    const { data:profile } = await supabase
      .from("profiles").select("full_name,email").eq("id",user_id).single();

    const { data:dep, error } = await supabase.from("deposits").insert({
      user_id, amount:num, reference, narration,
      status:"pending", method:"manual", provider:"manual",
      created_at: new Date().toISOString(),
    }).select().single();

    if(error) return res.status(500).json({ error:error.message });

    // Ping Telegram bot — non-blocking
    try {
      const { notifyDeposit } = require("./telegram");
      await notifyDeposit({
        id: dep.id, amount: num, narration,
        user_name:  profile?.full_name || "Unknown",
        user_email: profile?.email || "",
      });
    } catch(e) { console.warn("[deposit] Telegram notify failed:", e.message); }

    const { data:bankRows } = await supabase.from("site_settings").select("key,value").in("key",["bank_name","account_name","account_number"]);
    const bank=Object.fromEntries((bankRows||[]).map(s=>[s.key,s.value]));
    return res.json({ ok:true, reference, narration, amount:num,
      bank_name:bank.bank_name||"Serlzo Investments Energy Services", account_number:bank.account_number||"", account_name:bank.account_name||"Serlzo Investments Energy Services Ltd." });
  }

  // POST: initiate-paystack
  if(action==="initiate-paystack") {
    const reference = genRef("PS", user_id);
    const { error } = await supabase.from("deposits").insert({
      user_id, amount:num, reference,
      status:"pending", method:"paystack", provider:"paystack",
      created_at: new Date().toISOString(),
    });
    if(error) return res.status(500).json({ error:error.message });
    return res.json({ ok:true, reference, amount:num, public_key: process.env.PAYSTACK_PUBLIC_KEY });
  }

  return res.status(400).json({ error:"Unknown action: " + action });
};
