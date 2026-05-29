export function GET() {
  return new Response(`User-agent: *
Allow: /

Sitemap: https://sanmoshice.com/sitemap-index.xml
`);
}
