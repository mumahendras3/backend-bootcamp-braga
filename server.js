// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
// Require fastify-static and instantiate it
const fastifyStatic = require('fastify-static')

// Constants
const port = process.env.PORT || 5000 // default port is 5000

// Define the static website prefixed root paths
fastify.register(fastifyStatic, require('./prefixed-roots').public)

// Define the routes
fastify.register(require('./routes.js'))

// Run the server!
const start = async () => {
  try {
    await fastify.listen(port, '0.0.0.0')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
