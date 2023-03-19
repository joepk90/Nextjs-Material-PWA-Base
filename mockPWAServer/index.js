;(async () => {
  const mockttp = require('mockttp')
  var globToRegExp = require('glob-to-regexp')

  // Create a proxy server with a self-signed HTTPS CA certificate:
  const https = await mockttp.generateCACertificate()
  const server = mockttp.getLocal({ https })

  const HTTP = 'https://'
  const ORIGIN = 'example.com'
  const HOST = HTTP + ORIGIN

  await server
    .get(globToRegExp(`${HOST}/*`))
    .thenForwardTo('http://localhost:3000')

  await server.start()

  const caFingerprint = mockttp.generateSPKIFingerprint(https.cert)

  // run npm run chrome, to start the server AND launch chrome
  if (process.argv[2] === 'chrome') {
    const launchChrome = require('./launch-chrome')
    launchChrome(HOST, server, caFingerprint)
  } else {
    // Print out the server details for manual configuration:
    console.log(`Server running on port ${server.port}`)
    console.log(`CA cert fingerprint ${caFingerprint}`)
  }
})()
