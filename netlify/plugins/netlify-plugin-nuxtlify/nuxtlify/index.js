const { loadNuxtConfig, Nuxt } = require('nuxt')

const OVERRIDES = {
  dry: { dev: false, server: false },
  dev: { dev: true, _build: true },
  build: { dev: false, server: false, _build: true },
  start: { dev: false, _start: true },
}

async function loadNuxt(loadOptions) {
  // Normalize loadOptions
  if (typeof loadOptions === 'string') {
    loadOptions = { for: loadOptions }
  }
  const { ready = true } = loadOptions
  const _for = loadOptions.for || 'dry'

  // Get overrides
  const override = OVERRIDES[_for]

  // Unsupported purpose
  if (!override) {
    throw new Error('Unsupported for: ' + _for)
  }

  // Load Config
  const config = await loadNuxtConfig(loadOptions)

  // Apply config overrides
  Object.assign(config, loadOptions, override)

  // Initiate Nuxt
  const nuxt = new Nuxt(config)
  if (ready) {
    await nuxt.ready()
  }

  return nuxt
}

async function handler(event) {
  let nuxt
  try {
    nuxt = await loadNuxt({
      for: 'dev',
      rootDir: __dirname,
      buildDir: 'nuxt',
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
    return {
      statusCode: 500,
      headers: {
        contentType: 'text/plain',
      },
      body: e.toString(),
    }
  }

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
