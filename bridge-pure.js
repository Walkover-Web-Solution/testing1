(function () {
  var COOKIE = "ft_first_domain";
  var DAYS = 365;

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(^|; )" + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=([^;]*)"));
    return m ? decodeURIComponent(m[2]) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = "; Max-Age=" + String(days * 24 * 60 * 60);
    var secure = (location.protocol === "https:") ? "; Secure" : "";
    
    // Try SameSite=None first (for cross-site), fallback to Lax if it fails
    try {
      document.cookie = name + "=" + encodeURIComponent(value) + "; Path=/" + maxAge + "; SameSite=None" + secure;
      console.log("Cookie set with SameSite=None");
    } catch (e) {
      console.log("SameSite=None failed, trying SameSite=Lax:", e);
      document.cookie = name + "=" + encodeURIComponent(value) + "; Path=/" + maxAge + "; SameSite=Lax";
    }
  }

  window.addEventListener("message", function (event) {
    console.log("Bridge received message:", event.data);
    var data = event.data || {};
    if (data.type !== "GET_OR_SET_GLOBAL_FIRST_DOMAIN") return;

    var callerDomain = (data.domain || "").toLowerCase();
    if (!callerDomain) return;

    var first = getCookie(COOKIE);
    var wasSetNow = false;

    if (!first) {
      first = callerDomain;
      console.log("Setting cookie:", COOKIE, "=", first);
      setCookie(COOKIE, first, DAYS);
      wasSetNow = true;
      console.log("Cookie set. Document.cookie:", document.cookie);
    }

    event.source.postMessage(
      { type: "GLOBAL_FIRST_DOMAIN", first_domain: first, set_now: wasSetNow },
      event.origin
    );
  }, false);
})();
