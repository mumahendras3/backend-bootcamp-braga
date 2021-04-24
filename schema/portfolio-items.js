module.exports = {
  messageSchema: { type: "object", properties: { message: { type: "string" } } },
  paramsSchema: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "number" } },
  },
  portfolioItemSchema: {
    type: "object",
    required: [
      "filter",
      "imgSrc",
      "title",
      "summary",
      "galleryHref",
      "galleryTitle",
    ],
    properties: {
      filter: { type: "string" },
      imgSrc: { type: "string" },
      title: { type: "string" },
      summary: { type: "string" },
      galleryHref: { type: "string" },
      galleryTitle: { type: "string" },
    },
  },
};
