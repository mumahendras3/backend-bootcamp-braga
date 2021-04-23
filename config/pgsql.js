async function pgsql(fastify, options) {
  fastify.register(require("fastify-postgres"), {
    connectionString: fastify.config.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = require("fastify-plugin")(pgsql);