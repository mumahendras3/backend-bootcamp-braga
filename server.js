// Require the framework and instantiate it
const fastify = require('fastify')()
const fastifyStatic = require('fastify-static');
const port = process.env.PORT;

fastify.register(fastifyStatic, require('./config/static').public)

fastify.get('/', function (req, reply) {
  return reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
})

// Run the server!
fastify.listen(port, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
