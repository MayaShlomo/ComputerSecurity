(function () {
  "use strict";
  var meta = document.querySelector('meta[name="app-safe"]');
  var SAFE = (meta && meta.content) || location.pathname;

  try { history.replaceState({ lock: true }, "", SAFE); } catch (_) {}

  try { history.pushState({ lock: true }, "", SAFE); } catch (_) {}

  addEventListener("popstate", function (e) {
    if (e.state && e.state.lock) {
      history.go(1);          
    }
    location.replace(SAFE);   
  });

  addEventListener("pageshow", function (e) {
    if (e.persisted) location.replace(SAFE);
  });

  document.querySelectorAll(".replace-link, a.replace-link").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      location.replace(a.href);
    });
  });
})();