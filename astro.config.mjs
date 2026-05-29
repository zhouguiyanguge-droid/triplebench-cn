import { defineConfig } from "astro/config";

// 2026-05-29 07:40 — sitemap moved to static public/sitemap-*.xml
// (避免 @astrojs/sitemap 传递依赖在 CF Pages npm ci 时缺失)
export default defineConfig({
  site: "https://sanmoshice.com",
  output: "static"
});
