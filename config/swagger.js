const { messageSchema, paramsSchema, portfolioItemSchema } = require('../schema/portfolio-items');

module.exports = {
  routePrefix: "/api/docs",
  openapi: {
    info: {
      title: "REST API for backend-bootcamp-braga.herokuapp.com",
      description: "REST API for backend-bootcamp-braga.herokuapp.com",
      version: "0.0.1",
      contact: {
        name: "mumahendras3",
        url: "https://mumahendras3.github.io",
        email: "mumahendras3@gmail.com",
      },
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
    tags: [
      {
        name: "Portfolio Items",
        description: "For manipulating portfolio items",
      },
    ],
    components: {
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
        },
      },
      schemas: { messageSchema, paramsSchema, portfolioItemSchema },
    },
  },
  exposeRoute: true,
};