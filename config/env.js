const path = require("path");
const { envSchema } = require("../schema/env");

const options = {
  confKey: "config", // optional, default: 'config'
  schema: envSchema,
  dotenv: {
    path: path.posix.join(__dirname, "../.env"),
    // debug: true,
  },
};

module.exports = options;
