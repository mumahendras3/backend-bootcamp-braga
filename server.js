// Require the framework and instantiate it
const fastify = require("fastify")({ logger: false });

// Register fastify-env plugin
fastify.register(require("fastify-env"), require("./config/env"));

// Registering fastify-postgres through a wrapper script in ./config/pgsql.js
// to be able to access fastify.config.DATABASE_URL and pass it to the
// fastify-postgres plugin
fastify.register(require("./config/pgsql"));

// Register server-side rendering plugin (point of view)
fastify.register(require("point-of-view"), require("./config/ssr"));

// Define the static website prefixed root paths
fastify.register(
  require("fastify-static"),
  require("./config/prefixed-roots").public
);

// Define the routes
fastify.register(require("./routes/static"));
fastify.register(require("./routes/ssr"));
fastify.register(require("./routes/api.js"), { prefix: "/api" });

// Start the fastify server after all the plugins have been loaded
fastify.ready().then(
  () => {
    console.log("Fastify successfully booted!");
    // Listening on PORT (defined by environment variable)
    fastify
      .listen(fastify.config.PORT, "0.0.0.0")
      .then((address) => console.log(`Server listening on ${address}`))
      .catch((err) => {
        console.error("Error starting server:", err);
        process.exit(1);
      });
  },
  (err) => {
    console.error("Error booting fastify:", err);
    process.exit(1);
  }
);