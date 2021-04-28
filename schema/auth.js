module.exports = {
  userCredentialSchema: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string" },
      password: { type: "string" },
    },
  },
  token: {
    type: "object",
    properties: { token: { type: "string" } },
  },
};
