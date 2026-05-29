import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Force rebuild bump: 2026-05-29 02:25 — ensure @astrojs/sitemap is installed in CF Pages
export default defineConfig({
  site: "https://sanmoshice.com",
  output: "static",
  integrations: [sitemap()]
});
