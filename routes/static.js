async function routes(fastify, options) {
  fastify.get("/", async (request, reply) => {
    return reply.sendFile("index.html"); // Serve the index.html when '/' is requested
  });
}

module.exports = routes;