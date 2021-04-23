const data = require("../data/portfolio.json");

async function routes(fastify, options) {
  fastify.get("/portfolio.html", async (request, reply) => {
    const { rows } = await fastify.pg.query(
      "SELECT filter, img_src, title, summary, gallery_href, gallery_title FROM portfolio_items"
    );

    reply.view("/public/portfolio.ejs", {
      ...data,
      items: rows.map((row) => {
        return {
          filter: row.filter,
          imgSrc: row.img_src,
          title: row.title,
          summary: row.summary,
          galleryHref: row.gallery_href,
          galleryTitle: row.gallery_title,
        };
      }),
    });
  });
}

module.exports = routes;
