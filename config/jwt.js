async function jwt(fastify, options) {
  fastify.register(require("fastify-jwt"), {
    secret: fastify.config.JWT_SECRET,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = require("fastify-plugin")(jwt);
