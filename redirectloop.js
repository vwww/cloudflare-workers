addEventListener("fetch", event => {
  const url = new URL(event.request.url)
  url.pathname = `/${+url.pathname.slice(1) + 1}`
  event.respondWith(Response.redirect(url))
})
