
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

const isProd = process.env.NODE_ENV === 'production'

// change start-url cache strategy, so that we can prompt user to reload when
// new version available, instead of showing new version directly
runtimeCaching[0].handler = 'StaleWhileRevalidate'

module.exports = withPWA({
  trailingSlash: true,
  pwa: {
    disable: !isProd,
    dest: 'public',
    register: false,
    skipWaiting: false,
    runtimeCaching,
  },
})