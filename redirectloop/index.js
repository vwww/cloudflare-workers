addEventListener('fetch', (event) => event.respondWith(handler(event)))

async function handler (event) {
  const url = new URL(event.request.url)
  url.pathname = `/${+url.pathname.slice(1) + 1}`

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return Response.redirect(url.toString())
}
