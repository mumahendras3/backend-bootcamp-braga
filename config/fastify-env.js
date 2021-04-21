const path = require("path");

const schema = {
  type: "object",
  required: ["PORT"],
  properties: {
    PORT: {
      type: "string",
      default: 3000,
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

module.exports = { options: options };
