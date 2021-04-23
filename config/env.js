const path = require("path");

const schema = {
  type: "object",
  required: ["PORT", "DATABASE_URL"],
  properties: {
    PORT: {
      type: "string",
    },
    DATABASE_URL: {
      type: "string",
    },
  },
};

const options = {
  confKey: "config", // optional, default: 'config'
  schema: schema,
  dotenv: {
    path: path.posix.join(__dirname, "../.env"),
  },
};

module.exports = options;
