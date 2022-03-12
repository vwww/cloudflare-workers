addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // redirect HTTPS to HTTP
  if (url.protocol === 'https:') {
    url.protocol = 'http:'
    return event.respondWith(Response.redirect(url))
  }

  const e = url.pathname.slice(1)
  const endpoint = endpoints[e]
  const resp = endpoint ? makeResp(endpoint) : new Response('not found')
  event.respondWith(resp)
})

function makeResp ([contentEncoding, contentType, header]) {
  const { readable, writable } = new TransformStream()
  work(writable, header)
  const resp = new Response(readable, {
    headers: {
      'Content-Type': contentType,
      'Content-Encoding': contentEncoding,
    },
    encodeBody: 'manual',
  })
  return resp
}

const gzipHeader = new Uint8Array([
  0x1f, 0x8b, // ID1, ID2
  8,          // CM=deflate
  0,          // FLG
  0, 0, 0, 0, // MTIME
  4,    // XFL=(deflate:fast)
  0xff, // OS=unknown
  // DEFLATE block start
  0xED, 0xC0, 0x81, 0x00, 0x00, 0x00, 0x00, 0x80, 0xA0, 0xFD, 0xA9, 0x17, 0xA9,
])
const zlibHeader = new Uint8Array([
  0x08, // CMF=CM: deflate, CINFO: 256-byte window size
  0x1D, // FCHECK
  // DEFLATE block start
  0xED, 0xC0, 0x81, 0x00, 0x00, 0x00, 0x00, 0x80, 0xA0, 0xFD, 0xA9, 0x17, 0xA9,
])
const zeros = new Uint8Array(new Array(1024).fill(0))

async function work (writable, header) {
  let closed = false
  const writer = writable.getWriter()
  writer.closed.then(() => closed = true)

  writer.write(header)
  while (!closed) {
    await writer.write(zeros)
  }
}

const endpoints = {}

function registerEndpoints (path, encoding, header) {
  endpoints[path] = [encoding, 'application/octet-stream', header]
  endpoints[`${path}.html`] = [encoding, 'text/html', header]
  endpoints[`${path}.js`] = [encoding, 'text/javascript', header]
  endpoints[`${path}.css`] = [encoding, 'text/css', header]
  endpoints[`${path}.png`] = [encoding, 'image/png', header]
  endpoints[`${path}.mp4`] = [encoding, 'video/mp4', header]
  endpoints[`${path}.txt`] = [encoding, 'text/plain; charset=utf8', header]
}

registerEndpoints('gzip', 'gzip', gzipHeader)
registerEndpoints('zlib', 'deflate', zlibHeader)
