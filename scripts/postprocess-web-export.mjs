import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");

const appName = "Домашний бар";
const appDescription =
  "Подбор коктейлей из ингредиентов домашнего бара и подсказки, что выгоднее докупить.";

const manifest = {
  name: appName,
  short_name: "Бар",
  description: appDescription,
  lang: "ru",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#020d09",
  theme_color: "#020d09",
  icons: [
    {
      src: "/icon.png",
      sizes: "1024x1024",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/adaptive-icon.png",
      sizes: "1024x1024",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};

const staleServiceWorkerCleanup = `const CACHE_CLEANUP_VERSION = "domashniy-bar-stale-sw-cleanup-2026-06-21";

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      await self.registration.unregister();

      const clients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    })(),
  );
});
`;

function upsertHeadTag(html, tag, marker) {
  if (html.includes(marker)) {
    return html;
  }

  return html.replace("</head>", `  ${tag}\n</head>`);
}

let html = await readFile(indexPath, "utf8");

html = html.replace('<html lang="en">', '<html lang="ru">');
html = html.replace(
  'content="width=device-width, initial-scale=1, shrink-to-fit=no"',
  'content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"',
);
html = html.replace(/<title>.*?<\/title>/, `<title>${appName}</title>`);
html = html.replace(
  "You need to enable JavaScript to run this app.",
  "Для работы приложения включите JavaScript.",
);

html = upsertHeadTag(
  html,
  `<meta name="description" content="${appDescription}" />`,
  'name="description"',
);
html = upsertHeadTag(
  html,
  '<meta name="application-name" content="Домашний бар" />',
  'name="application-name"',
);
html = upsertHeadTag(
  html,
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  "apple-mobile-web-app-capable",
);
html = upsertHeadTag(
  html,
  '<meta name="apple-mobile-web-app-title" content="Домашний бар" />',
  'apple-mobile-web-app-title',
);
html = upsertHeadTag(
  html,
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  "apple-mobile-web-app-status-bar-style",
);
html = upsertHeadTag(html, '<link rel="manifest" href="/manifest.json" />', 'rel="manifest"');
html = upsertHeadTag(html, '<link rel="apple-touch-icon" href="/icon.png" />', 'rel="apple-touch-icon"');

// Optional cookieless Matomo analytics. Only injected when the build environment provides both
// MATOMO_URL (e.g. https://stats.example.de/) and MATOMO_SITE_ID; local builds stay untracked.
// Cookieless + anonymized IP (server-side) + Do-Not-Track respected = no consent banner needed.
const matomoUrl = (process.env.MATOMO_URL ?? "").trim().replace(/\/+$/, "");
const matomoSiteId = (process.env.MATOMO_SITE_ID ?? "").trim();

if (matomoUrl && /^\d+$/.test(matomoSiteId)) {
  const matomoSnippet = `<script>
    var _paq = window._paq = window._paq || [];
    _paq.push(["disableCookies"]);
    _paq.push(["setDoNotTrack", true]);
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    (function () {
      var u = "${matomoUrl}/";
      _paq.push(["setTrackerUrl", u + "matomo.php"]);
      _paq.push(["setSiteId", "${matomoSiteId}"]);
      var d = document, g = d.createElement("script"), s = d.getElementsByTagName("script")[0];
      g.async = true; g.src = u + "matomo.js"; s.parentNode.insertBefore(g, s);
      // The app is a single page: report in-app navigation (tabs, /cocktails/:id) as page views.
      var track = function () {
        _paq.push(["setCustomUrl", location.pathname + location.search]);
        _paq.push(["setDocumentTitle", d.title]);
        _paq.push(["trackPageView"]);
      };
      ["pushState", "replaceState"].forEach(function (m) {
        var orig = history[m];
        history[m] = function () { var r = orig.apply(this, arguments); setTimeout(track, 0); return r; };
      });
      window.addEventListener("popstate", track);
    })();
  </script>`;
  html = upsertHeadTag(html, matomoSnippet, "matomo.js");
}

await writeFile(indexPath, html, "utf8");
await writeFile(path.join(distDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(path.join(distDir, "sw.js"), staleServiceWorkerCleanup, "utf8");
await writeFile(path.join(distDir, "service-worker.js"), staleServiceWorkerCleanup, "utf8");
await copyFile(path.resolve("assets/icon.png"), path.join(distDir, "icon.png"));
await copyFile(path.resolve("assets/adaptive-icon.png"), path.join(distDir, "adaptive-icon.png"));
