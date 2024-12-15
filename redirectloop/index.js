addEventListener('fetch', (event) => event.respondWith(handler(event)))

const ROBOTS_TEXT = `User-agent: *
Allow: /$
Allow: /1
Allow: /2
Disallow: /`

async function handler (event) {
  const url = new URL(event.request.url)

  if (url.pathname == '/robots.txt') {
    return new Response(ROBOTS_TEXT)
  }

  url.pathname = `/${+url.pathname.slice(1) + 1}`

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return Response.redirect(url.toString())
}
