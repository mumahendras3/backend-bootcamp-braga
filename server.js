// Require the framework and instantiate it
const fastify = require('fastify')()
const fastifyStatic = require('fastify-static');
const path = require('path')

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/', // optional: default '/'
})

fastify.get('/', function (req, reply) {
  return reply.sendFile('index.html') // serving path.join(__dirname, 'public', 'myHtml.html') directly
})

// Run the server!
fastify.listen(3000, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})