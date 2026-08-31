/**
 * /api/user.js
 * POST ?action=update-profile   → update profile
 * POST ?action=add-bank-card    → add bank card
 * POST ?action=delete-bank-card → remove bank card
 * POST ?action=collect-income   → collect daily income from products
 * GET  ?action=bank-cards&user_id= → list bank cards
 * GET  ?action=my-products&user_id= → list user products
 */
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function createUserClient(accessToken) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    }
  );
}

module.exports = async function(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization");
  if(req.method==="OPTIONS") return res.status(200).end();

  const action   = req.query.action;
  const user_id  = req.method==="GET" ? req.query.user_id : req.body?.user_id;
  const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if(!user_id) return res.status(400).json({ error:"user_id required" });

  let userSupabase = null;
  if(action === "collect-income") {
    if(!bearer) return res.status(401).json({ error:"Authentication required" });
    const { data: authData, error: authError } = await supabase.auth.getUser(bearer);
    if(authError || !authData?.user || authData.user.id !== user_id) {
      return res.status(401).json({ error:"Authentication required" });
    }
    if(!process.env.SUPABASE_URL || (!process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      return res.status(503).json({ error:"Supabase server configuration is incomplete" });
    }
    userSupabase = createUserClient(bearer);
  }

  if(req.method==="GET") {
    if(action==="bank-cards") {
      const { data,error } = await supabase.from("bank_cards").select("*").eq("user_id",user_id).order("is_default",{ascending:false});
      if(error) return res.status(500).json({ error:error.message });
      return res.json({ ok:true, cards:data||[] });
    }
    if(action==="my-products") {
      const { data,error } = await supabase.from("user_products").select("*,products(name,description)").eq("user_id",user_id).order("created_at",{ascending:false});
      if(error) return res.status(500).json({ error:error.message });
      return res.json({ ok:true, products:data||[] });
    }
    return res.status(400).json({ error:"Unknown action" });
  }

  if(req.method!=="POST") return res.status(405).json({ error:"Method not allowed" });

  if(action==="update-profile") {
    const { full_name, phone } = req.body;
    const { error } = await supabase.from("profiles").update({ full_name, phone, updated_at:new Date().toISOString() }).eq("id",user_id);
    if(error) return res.status(500).json({ error:error.message });
    return res.json({ ok:true });
  }

  if(action==="add-bank-card") {
    const { bank_name, account_number, account_name, is_default } = req.body;
    if(!bank_name||!account_number||!account_name) return res.status(400).json({ error:"All fields required" });
    if(is_default) {
      await supabase.from("bank_cards").update({ is_default:false }).eq("user_id",user_id);
    }
    const { error } = await supabase.from("bank_cards").insert({ user_id, bank_name, account_number, account_name, is_default:!!is_default });
    if(error) return res.status(500).json({ error:error.message });
    return res.json({ ok:true });
  }

  if(action==="delete-bank-card") {
    const { card_id } = req.body;
    const { error } = await supabase.from("bank_cards").delete().eq("id",card_id).eq("user_id",user_id);
    if(error) return res.status(500).json({ error:error.message });
    return res.json({ ok:true });
  }

  if(action==="collect-income") {
    const { data, error } = await userSupabase.rpc("collect_daily_income", { p_user_id:user_id });
    if(error) {
      const rawError=String(error.message||"");
      const missingFunction=error.code==="PGRST202" || /collect_daily_income|schema cache/i.test(rawError);
      return res.status(500).json({
        error: missingFunction
          ? "Daily income collection is not installed yet. Run supabase/migrations/20260831_create_collect_daily_income.sql in the Supabase SQL Editor, then reload this page."
          : rawError || "Unable to collect daily income"
      });
    }
    return res.json(data || { ok:false, error:"Nothing to collect today" });
  }

  return res.status(400).json({ error:"Unknown action" });
};
    
