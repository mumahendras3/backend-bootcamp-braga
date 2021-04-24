module.exports = {
  messageSchema: {
    type: "object",
    properties: { message: { type: "string" } },
  },
  paramsSchema: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "number" } },
  },
};
