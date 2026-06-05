// Server-side analytics proxy. Token stays in env (Pages secret), never reaches the browser.
// Queries Cloudflare Web Analytics (RUM) GraphQL and returns compact JSON.
const VERSION = "v2-20260606";
const ACCOUNT_TAG = "5aeb1932ab22e08c6587ce04c186127d";
const DEFAULT_SITE_TAG = "aef5c25ae6974caa85fa9bba93e975ff"; // sanmoshice.com

function j(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function onRequest(context) {
  const { env } = context;
  const token = env.CF_ANALYTICS_TOKEN;
  const siteTag = env.CF_SITE_TAG || DEFAULT_SITE_TAG;
  if (!token) return j({ ok: false, error: "no_token", message: "CF_ANALYTICS_TOKEN 未配置", version: VERSION, envKeys: Object.keys(env || {}) });

  const days = 7;
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  const start = new Date(now.getTime() - (days - 1) * 86400000).toISOString().slice(0, 10);

  const query = `
  query ($accountTag: String!, $siteTag: String!, $start: String!, $end: String!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        total: rumPageloadEventsAdaptiveGroups(limit: 1, filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }) {
          count
          sum { visits }
        }
        daily: rumPageloadEventsAdaptiveGroups(limit: 100, filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }, orderBy: [date_ASC]) {
          count
          dimensions { date }
          sum { visits }
        }
        pages: rumPageloadEventsAdaptiveGroups(limit: 10, filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }, orderBy: [count_DESC]) {
          count
          dimensions { requestPath }
        }
        countries: rumPageloadEventsAdaptiveGroups(limit: 10, filter: { siteTag: $siteTag, date_geq: $start, date_leq: $end }, orderBy: [count_DESC]) {
          count
          dimensions { countryName }
        }
      }
    }
  }`;

  let res, body;
  try {
    res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ query, variables: { accountTag: ACCOUNT_TAG, siteTag, start, end } }),
    });
    body = await res.json();
  } catch (e) {
    return j({ ok: false, error: "fetch_failed", message: String(e) });
  }

  if (body.errors && body.errors.length) {
    return j({ ok: false, error: "graphql_error", message: body.errors.map(e => e.message).join("; ") });
  }

  const acct = body?.data?.viewer?.accounts?.[0];
  if (!acct) return j({ ok: false, error: "no_data", message: "未取到账户数据，检查 token 权限是否含 Account Analytics:Read" });

  const totalPV = acct.total?.[0]?.count || 0;
  const totalVisits = acct.total?.[0]?.sum?.visits || 0;
  const daily = (acct.daily || []).map(d => ({ date: d.dimensions.date, pv: d.count, visits: d.sum?.visits || 0 }));
  const pages = (acct.pages || []).map(p => ({ path: p.dimensions.requestPath, pv: p.count }));
  const countries = (acct.countries || []).map(c => ({ country: c.dimensions.countryName, pv: c.count }));

  return j({ ok: true, range: { start, end, days }, totalPV, totalVisits, daily, pages, countries });
}
