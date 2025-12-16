<script>
(function () {
  var ORIGIN = "https://testing.saltbooks.com";
  var DAYS = 365;

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(^|; )" + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=([^;]*)"));
    return m ? decodeURIComponent(m[2]) : null;
  }

  function setCookie(name, value, days, sameSite) {
    var maxAge = "; Max-Age=" + String(days * 24 * 60 * 60);
    var secure = (location.protocol === "https:") ? "; Secure" : "";
    document.cookie = name + "=" + encodeURIComponent(value) +
      "; Path=/" + maxAge + "; SameSite=" + (sameSite || "Lax") + secure;
  }

  // 1) Get current domain to send to bridge
  var localFirst = location.hostname.toLowerCase();

  // 2) Ask bridge for global first domain (cross-domain test)
  var f = document.createElement("iframe");
  f.style.position = "fixed";
  f.style.left = "-9999px";
  f.style.top = "-9999px";
  f.style.width = "1px";
  f.style.height = "1px";
  f.style.border = "0";
  f.src = ORIGIN + "/bridge.js";

  function cleanup() {
    window.removeEventListener("message", onMsg);
    try { if (f.parentNode) f.parentNode.removeChild(f); } catch (err) {}
  }

  function onMsg(e) {
    if (e.origin !== ORIGIN) return;
    if (!e.data || e.data.type !== "GLOBAL_FIRST_DOMAIN") return;

    var globalFirst = (e.data.first_domain || "").toLowerCase();

    if (globalFirst) {
      alert("First Domain: " + globalFirst);
    } else {
      alert("No first domain found");
    }

    cleanup();
  }

  window.addEventListener("message", onMsg, false);

  f.onload = function () {
    try {
      f.contentWindow.postMessage(
        { type: "GET_OR_SET_GLOBAL_FIRST_DOMAIN", domain: localFirst },
        ORIGIN
      );
    } catch (err) {}
  };

  (document.body || document.documentElement).appendChild(f);
})();
</script>
