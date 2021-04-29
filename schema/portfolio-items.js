module.exports = {
  portfolioItemSchema: {
    type: "object",
    required: [
      "filter",
      "img_src",
      "title",
      "summary",
      "gallery_href",
      "gallery_title",
    ],
    properties: {
      filter: { type: "string" },
      img_src: { type: "string" },
      title: { type: "string" },
      summary: { type: "string" },
      gallery_href: { type: "string" },
      gallery_title: { type: "string" },
    },
  },
};
