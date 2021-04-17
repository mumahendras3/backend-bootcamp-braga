// Require the framework and instantiate it
const fastify = require('fastify')()
const fastifyStatic = require('fastify-static');

fastify.register(fastifyStatic, require('./config/static').public)

fastify.get('/', function (req, reply) {
  return reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
})

// Run the server!
fastify.listen(5000, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
