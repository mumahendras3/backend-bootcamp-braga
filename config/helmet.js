async function helmet(fastify, options) {
  fastify.register(require("fastify-helmet"), (instance) => {
    return {
      contentSecurityPolicy: {
        directives: {
          ...require("fastify-helmet").contentSecurityPolicy.getDefaultDirectives(),
          "form-action": ["self"],
          "img-src": ["self", "data:", "validator.swagger.io"],
          "script-src": ["self"].concat(instance.swaggerCSP.script),
          "style-src": ["self", "https:"].concat(instance.swaggerCSP.style),
        },
      },
    };
  });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = require("fastify-plugin")(helmet);
