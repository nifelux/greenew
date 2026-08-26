/* Serlzo Investments Supabase bootstrap. Public browser config may come from page data attributes or /api/config. */
(function () {
  "use strict";

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

  function inlineConfig() {
    var body = document.body;
    var url = normaliseUrl(body?.dataset?.supabaseUrl || "");
    var anon = String(body?.dataset?.supabaseAnon || "").trim();
    if (!url || url === "https://YOUR_SUPABASE_URL" || !anon || anon === "YOUR_SUPABASE_ANON_KEY") return null;
    return { supabaseUrl: url, supabaseAnon: anon };
  }

  function setConfigError(message, code) {
    window.SerlzoConfig = { ok: false, code: code || "CONFIG_ERROR", error: message };
    window.SerlzoUI?.hideLoader();
  }

  window.SerlzoReady = (async function () {
    var config = inlineConfig();

    if (!config) {
      try {
        var response = await fetch("/api/config", {
          headers: { Accept: "application/json" },
          cache: "no-store"
        });
        var payload = await response.json().catch(function () { return null; });
        var configuredUrl = normaliseUrl(payload?.supabaseUrl);
        var configuredAnon = String(payload?.supabaseAnon || "").trim();
        if (response.ok && configuredUrl && configuredAnon) {
          config = { supabaseUrl: configuredUrl, supabaseAnon: configuredAnon };
        } else {
          setConfigError(
            payload?.error || "Serlzo Investments public Supabase configuration is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.",
            response.status === 503 ? "CONFIG_MISSING" : "CONFIG_INVALID"
          );
          return null;
        }
      } catch (error) {
        setConfigError(
          "Serlzo Investments could not reach /api/config. Confirm that the deployment includes the API functions and redeploy.",
          "CONFIG_ENDPOINT_UNREACHABLE"
        );
        return null;
      }
    }

    if (typeof window.supabase === "undefined") {
      setConfigError("The Serlzo Investments Supabase client library did not load. Check the CDN policy or network connection.", "CLIENT_LIBRARY_MISSING");
      return null;
    }

    try {
      window.sb = window.supabase.createClient(config.supabaseUrl, config.supabaseAnon, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
      });
      // The anon key is public by design and is needed by the registration preflight.
      window.SerlzoConfig = {
        ok: true,
        code: "READY",
        supabaseUrl: config.supabaseUrl,
        supabaseAnon: config.supabaseAnon
      };
      window.SerlzoUI?.hideLoader();
      return window.sb;
    } catch (error) {
      setConfigError("Serlzo Investments received an invalid Supabase public configuration. Check SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.", "CONFIG_INVALID");
      return null;
    }
  })();
})();
