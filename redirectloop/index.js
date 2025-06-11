addEventListener('fetch', (event) => event.respondWith(handler(event)))

const ROBOTS_TEXT = `User-agent: *
Allow: /$
Allow: /1$
Allow: /2$
Disallow: /`

async function handler (event) {
  const url = new URL(event.request.url)

  if (url.pathname == '/robots.txt') {
    return new Response(ROBOTS_TEXT)
  }

  const n = +url.pathname.slice(1)
  const nNext =
    Number.isFinite(n)
    && n >= Number.MIN_SAFE_INTEGER
    && n <= Number.MAX_SAFE_INTEGER
      ? Math.floor(n) + 1
      : 0
  url.pathname = `/${nNext}`

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return Response.redirect(url.toString())
}
