const path = require('path')
const { EOL } = require('os')
const fs = require('fs-extra')
const DEFAULT_FUNCTIONS_SRC = 'netlify/functions'

module.exports = {
  onBuild({ netlifyConfig, packageJson, constants, utils }) {
    const FUNCTIONS_SRC = constants.FUNCTIONS_SRC || DEFAULT_FUNCTIONS_SRC
    const NUXTLIFY_DEST = path.join(FUNCTIONS_SRC, 'nuxtlify')
    fs.copySync(path.join(__dirname, 'nuxtlify'), NUXTLIFY_DEST)
    fs.copySync('.nuxt', path.join(NUXTLIFY_DEST, 'nuxt'))
    const clientConfig = fs.readJsonSync(
      path.join('.nuxt', 'dist', 'server', 'client.manifest.json')
    )
    fs.copySync(
      path.join('.nuxt', 'dist', 'client'),
      path.join(constants.PUBLISH_DIR, clientConfig.publicPath)
    )

    const redirects = []
    if (fs.existsSync('_redirects')) {
      redirects.push(fs.readFileSync('_redirects', 'utf8'))
    }
    redirects.push('# nuxt catch alls')
    redirects.push(
      `/${clientConfig.publicPath}/* /${clientConfig.publicPath}/:splat 200`
    )
    redirects.push('/* /.netlify/functions/nuxtlify/:splat 200!')
    fs.writeFileSync(
      path.join(constants.PUBLISH_DIR, '_redirects'),
      redirects.join(EOL)
    )

    const lambdaPackageJson = fs.readJsonSync(
      path.join(NUXTLIFY_DEST, 'package.json')
    )
    lambdaPackageJson.dependencies = packageJson.dependencies
    fs.writeJsonSync(
      path.join(NUXTLIFY_DEST, 'package.json'),
      lambdaPackageJson
    )
  },
}
