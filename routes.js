async function routes (fastify, options) {
  fastify.get('/', async (request, reply) => {
      return reply.sendFile('index.html') // Serve the index.html when '/' is requested
  })
  fastify.get('/hello', async (request, reply) => {
      return { text: "Hello World!" }
  })
}

module.exports = routes
