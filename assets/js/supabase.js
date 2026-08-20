/* Greenew Supabase bootstrap. Configure the public browser values for your deployment. */
(function () {
  "use strict";
  var SUPABASE_URL = document.body?.dataset?.supabaseUrl || "YOUR_SUPABASE_URL";
  var SUPABASE_ANON = document.body?.dataset?.supabaseAnon || "YOUR_SUPABASE_ANON_KEY";

  if (!SUPABASE_URL || SUPABASE_URL === "YOUR_SUPABASE_URL" || !SUPABASE_ANON || SUPABASE_ANON === "YOUR_SUPABASE_ANON_KEY") {
    console.warn("GREENEW: Supabase is not configured. Add the public values to the page config or your deployment template.");
    return;
  }
  if (typeof window.supabase === "undefined") {
    console.error("GREENEW: Supabase client library is not loaded.");
    return;
  }
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  });
  window.GreenewUI?.hideLoader();
})();
