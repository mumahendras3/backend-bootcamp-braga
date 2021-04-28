module.exports = {
  envSchema: {
    type: "object",
    required: ["PORT", "DATABASE_URL", "JWT_SECRET", "ADMIN_EMAIL"],
    properties: {
      PORT: {
        type: "string",
      },
      DATABASE_URL: {
        type: "string",
      },
      JWT_SECRET: {
        type: "string",
      },
      ADMIN_EMAIL: {
        type: "string",
      },
    },
  },
};
