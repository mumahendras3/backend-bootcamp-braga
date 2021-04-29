async function routes(fastify, options) {
  // Portfolio page
  fastify.get("/portfolio.html", async (request, reply) => {
    const { rows } = await fastify.pg.query(
      "SELECT filter, img_src, title, summary, gallery_href, gallery_title FROM portfolio_items"
    );
    // Create an array containing all available filters
    let filters = [];
    rows.forEach((row) => {
      filters.push(row.filter);
    });
    // Remove duplicate filters
    const uniqueFilters = filters.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    // Generate a suitable data for use by ejs
    const data = { filters: [], items: rows };
    uniqueFilters.forEach((filter) => {
      data["filters"].push({
        "filter-class": `.${filter}`,
        "filter-text": filter.split("-")[1],
      });
    });
    reply.view("/public/portfolio.ejs", data);
  });

  // Resume page
  fastify.get("/resume.html", async (request, reply) => {
    const { rows } = await fastify.pg.query(
      'SELECT "column", title, items FROM resume_entries'
    );
    reply.view("/public/resume.ejs", { entries: rows });
  });
}

module.exports = routes;
