<!doctype html>
<html>
<body>
<script>
(function () {
  "use strict";

  // Simple token gate (no allowlist)
  var SHARED_SECRET = "CHANGE_ME_TO_RANDOM_LONG_SECRET";

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(^|; )" + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + "=([^;]*)"));
    return m ? decodeURIComponent(m[2]) : null;
  }

  function setCookie(name, value, days) {
    var maxAge = "; Max-Age=" + String(days * 24 * 60 * 60);
    var secure = location.protocol === "https:" ? "; Secure" : "";
    // Needed for third-party iframe cookie attempts
    document.cookie = name + "=" + encodeURIComponent(value) +
      "; Path=/" + maxAge + "; SameSite=None" + secure;
  }

  function makeKey() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    var s = "";
    for (var i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }

  var COOKIE = "ft_dummy_key";
  var DAYS = 365;

  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "GET_DUMMY_KEY") return;
    if (data.token !== SHARED_SECRET) return;

    var key = getCookie(COOKIE);
    if (!key) {
      key = makeKey();
      setCookie(COOKIE, key, DAYS);
    }

    event.source.postMessage({ type: "DUMMY_KEY", key: key }, event.origin);
  });
})();
</script>
</body>
</html>