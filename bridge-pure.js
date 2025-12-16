(function () {
  var SHARED_SECRET = "YOUR_SECRET"; // TODO: Replace with actual shared secret
  var COOKIE = "ft_first_domain";
  var DAYS = 365;

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(^|; )" + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=([^;]*)"));
    return m ? decodeURIComponent(m[2]) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = "; Max-Age=" + String(days * 24 * 60 * 60);
    var secure = (location.protocol === "https:") ? "; Secure" : "";
    // Needed for iframe cross-site cookie attempt
    document.cookie = name + "=" + encodeURIComponent(value) + "; Path=/" + maxAge + "; SameSite=None" + secure;
  }

  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "GET_FIRST_DOMAIN") return;
    if (data.token !== SHARED_SECRET) return;

    var callerDomain = (data.domain || "").toLowerCase();
    if (!callerDomain) return;

    var first = getCookie(COOKIE);
    var wasSetNow = false;

    if (!first) {
      first = callerDomain;
      setCookie(COOKIE, first, DAYS);
      wasSetNow = true;
    }

    event.source.postMessage(
      { type: "FIRST_DOMAIN", first_domain: first, set_now: wasSetNow },
      event.origin
    );
  }, false);
})();
