module.exports = {
  resumeEntrySchema: {
    type: "object",
    required: ["column", "title", "items"],
    properties: {
      column: { type: "number" },
      title: { type: "string" },
      items: { type: "array", items: { type: "string" } },
    },
  },
};
