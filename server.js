// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });

// Register server-side rendering plugin (point of view)
fastify.register(require("point-of-view"), {
  engine: {
    ejs: require("ejs"), // Using EJS as the templates engine
  },
});

// Define the static website prefixed root paths
fastify.register(
  require("fastify-static"),
  require("./config/prefixed-roots").public
);

// Define the routes
fastify.register(require("./routes/static"));
fastify.register(require("./routes/ssr"));

// Function wrapper to start the server
const start = async (fastify) => {
  try {
    await fastify.listen(fastify.config.PORT, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Register fastify-env plugin and start the server based on the .env values
fastify
  .register(require("fastify-env"), require("./config/fastify-env").options)
  .ready((err) => {
    if (err) console.error(err);

    // Start the server, passing the fastify instance that holds the informations parsed from .env
    start(fastify);
  });
