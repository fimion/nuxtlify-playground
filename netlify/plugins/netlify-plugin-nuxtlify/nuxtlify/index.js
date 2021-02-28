const fs = require('fs')
const { loadNuxt } = require('nuxt')
async function handler(event) {
  fs.readdir(__dirname + '/.nuxt', (err, files) => {
    // eslint-disable-next-line no-console
    console.log(err)
    // eslint-disable-next-line no-console
    console.log(files)
  })
  const nuxt = await loadNuxt({ for: 'start', rootDir: __dirname })

  const searchParams = new URLSearchParams()

  Object.keys(event.queryStringParameters).forEach((e) => {
    searchParams.append(e, event.queryStringParameters[e])
  })

  const queryString = searchParams.toString().length
    ? `?${searchParams.toString()}`
    : ''

  const route = event.path + queryString
  const { html, error, redirected } = await nuxt.renderRoute(route)
  if (error) {
    return {
      statusCode: error.statusCode,
      body: error.message,
    }
  }
  if (redirected) {
    return {
      statusCode: redirected.status,
      headers: {
        location: redirected.path,
      },
    }
  }

  return {
    statusCode: 200,
    headers: {
      contentType: 'text/html',
    },
    body: html,
  }
}

exports.handler = handler
