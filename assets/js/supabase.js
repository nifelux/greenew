/* Serlzo Investments Supabase bootstrap. Public browser config may come from page data attributes or /api/config. */
(function () {
  "use strict";

  function firstValue() {
    for (var i = 0; i < arguments.length; i += 1) {
      if (arguments[i] && String(arguments[i]).trim()) return String(arguments[i]).trim();
    }
    return "";
  }

  function inlineConfig() {
    var body = document.body;
    var url = body?.dataset?.supabaseUrl || "";
    var anon = body?.dataset?.supabaseAnon || "";
    if (!url || url === "YOUR_SUPABASE_URL" || !anon || anon === "YOUR_SUPABASE_ANON_KEY") return null;
    return { supabaseUrl: url, supabaseAnon: anon };
  }

  function setConfigError(message) {
    window.SerlzoConfig = { ok: false, error: message };
    window.SerlzoUI?.hideLoader();
  }

  window.SerlzoReady = (async function () {
    var config = inlineConfig();

    if (!config) {
      try {
        var response = await fetch("/api/config", { headers: { Accept: "application/json" } });
        var payload = await response.json().catch(function () { return null; });
        if (response.ok && payload?.supabaseUrl && payload?.supabaseAnon) {
          config = { supabaseUrl: payload.supabaseUrl, supabaseAnon: payload.supabaseAnon };
        } else {
          setConfigError(payload?.error || "Serlzo Investments public Supabase configuration is missing.");
          return null;
        }
      } catch (error) {
        setConfigError("Serlzo Investments could not reach its public configuration endpoint. Check the deployment and try again.");
        return null;
      }
    }

    if (typeof window.supabase === "undefined") {
      setConfigError("The Serlzo Investments Supabase client library did not load. Check the CDN policy or network connection.");
      return null;
    }

    try {
      window.sb = window.supabase.createClient(config.supabaseUrl, config.supabaseAnon, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
      });
      window.SerlzoConfig = { ok: true, supabaseUrl: config.supabaseUrl };
      window.SerlzoUI?.hideLoader();
      return window.sb;
    } catch (error) {
      setConfigError("Serlzo Investments received an invalid Supabase public configuration.");
      return null;
    }
  })();
})();
