module.exports = {
  mailSchema: {
    type: "object",
    required: ["name", "email", "subject", "message"],
    properties: {
      name: { type: "object", properties: { value: { type: "string" } } },
      email: { type: "object", properties: { value: { type: "string" } } },
      subject: { type: "object", properties: { value: { type: "string" } } },
      message: { type: "object", properties: { value: { type: "string" } } },
    },
  },
};
