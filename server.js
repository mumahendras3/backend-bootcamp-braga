// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fastifyStatic = require('fastify-static')
const port = process.env.PORT

fastify.register(fastifyStatic, require('./config/static').public)

// Declare a route
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(port)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
