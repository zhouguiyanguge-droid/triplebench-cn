export function GET() {
  return new Response(`User-agent: *
Allow: /

Sitemap: https://cn.triplebench.com/sitemap-index.xml
`);
}
