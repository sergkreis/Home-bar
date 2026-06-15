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

await writeFile(indexPath, html, "utf8");
await writeFile(path.join(distDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await copyFile(path.resolve("assets/icon.png"), path.join(distDir, "icon.png"));
await copyFile(path.resolve("assets/adaptive-icon.png"), path.join(distDir, "adaptive-icon.png"));
