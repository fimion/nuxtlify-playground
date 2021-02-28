/*
[[redirects]]
from="/*"
to="/.netlify/functions/nuxtlify/:splat"
status=200
force=true
 */

module.exports = {
  onBuild(context) {
    console.log(context)
  },
}
