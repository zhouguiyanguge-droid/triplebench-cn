export function GET() {
  return new Response(`User-agent: *
Allow: /

Sitemap: https://triplebench-cn.pages.dev/sitemap-index.xml
`);
}
