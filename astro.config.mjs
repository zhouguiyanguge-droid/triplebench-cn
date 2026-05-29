import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://triplebench-cn.pages.dev",
  output: "static",
  integrations: [sitemap()]
});
