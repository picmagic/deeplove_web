// Extract roleId from URL path like /character/chat/603964
function getRoleId() {
  var match = window.location.pathname.match(/\/character\/chat\/([^/?#]+)/);
  return match ? match[1] : null;
}

// Build Adjust tracker URL with campaign params and deep link
function buildURL(p0, p1, p2, p3, p4, p5, p6, fbclid, fbpid) {
  if (!p0) return null;

  var campaign = (p1 || p2) ? p1 + "(" + p2 + ")" : "";
  var adgroup   = (p3 || p4) ? p3 + "(" + p4 + ")" : "";
  var creative  = (p5 || p6) ? p5 + "(" + p6 + ")" : "";

  var params = {
    campaign: campaign,
    adgroup: adgroup,
    creative: creative,
    fbclid: fbclid || "",
    fbpid: fbpid || "",
  };

  var roleId = getRoleId();
  if (roleId) {
    params.deep_link_path = "deeplove://chat?role=" + roleId;
  }

  return (
    "https://app.adjust.com/" +
    p0 +
    "?" +
    Object.keys(params)
      .map(function (key) { return key + "=" + encodeURIComponent(params[key]); })
      .join("&")
  );
}

// Get _fbp cookie written by Facebook Pixel
function getFbPid() {
  var m = document.cookie.match(/(^|;) ?_fbp=([^;]*)(;|$)/);
  return m ? m[2] : null;
}

(function () {
  var urlParams = new URLSearchParams(window.location.search);
  var adjustUrl = buildURL(
    urlParams.get("p0"),
    urlParams.get("p1"),
    urlParams.get("p2"),
    urlParams.get("p3"),
    urlParams.get("p4"),
    urlParams.get("p5"),
    urlParams.get("p6"),
    urlParams.get("fbclid"),
    getFbPid()
  );

  if (!adjustUrl) return;

  // Update any .AdjustTracker elements already in the DOM
  function applyToExisting() {
    var els = document.querySelectorAll(".AdjustTracker");
    for (var i = 0; i < els.length; i++) {
      els[i].setAttribute("href", adjustUrl);
    }
  }

  // Watch for elements added later by React (e.g. modal buttons)
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        if (node.classList && node.classList.contains("AdjustTracker")) {
          node.setAttribute("href", adjustUrl);
        }
        var nested = node.querySelectorAll(".AdjustTracker");
        for (var k = 0; k < nested.length; k++) {
          nested[k].setAttribute("href", adjustUrl);
        }
      }
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyToExisting();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    applyToExisting();
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
