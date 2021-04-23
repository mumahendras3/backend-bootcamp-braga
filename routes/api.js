// Additional plugin to safely create dynamic SQL queries
const format = require("pg-format");

// Route options definitions
const tableOpts = {
  schema: {
    params: {
      type: "object",
      properties: {
        table: { type: "string" },
      },
    },
  },
};
const tableIdOpts = {
  schema: {
    params: {
      type: "object",
      properties: {
        table: { type: "string" },
        id: { type: "number" },
      },
    },
  },
};
const insertTableOpts = {
  schema: {
    params: {
      type: "object",
      properties: {
        table: { type: "string" },
      },
    },
    body: {
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
  },
};
const updateTableIdOpts = {
  schema: {
    params: {
      type: "object",
      properties: {
        table: { type: "string" },
        id: { type: "number" },
      },
    },
    body: {
      type: "object",
      properties: {
        filter: { type: "string" },
        imgSrc: { type: "string" },
        title: { type: "string" },
        summary: { type: "string" },
        galleryHref: { type: "string" },
        galleryTitle: { type: "string" },
      },
    },
  },
};

async function routes(fastify, options) {
  // List available rows from portfolio_items table in an array
  fastify.get("/:table", tableOpts, async (req, res) => {
    const { rows } = await fastify.pg.query(
      format("SELECT * FROM %I", req.params.table)
    );
    return rows;
  });

  // List specific row from portfolio_items table
  fastify.get("/:table/:id", tableIdOpts, async (req, res) => {
    const { rows } = await fastify.pg.query(
      format("SELECT * FROM %I WHERE id=%L", req.params.table, req.params.id)
    );
    if (rows[0]) msg = rows[0];
    else
      msg = {
        Message: `No row with id=${req.params.id} found in table=${req.params.table}!`,
      };
    return msg;
  });

  // Insert a new row
  fastify.post("/insert/:table", insertTableOpts, async (req, res) => {
    return fastify.pg.transact(async (client) => {
      const table = req.params.table;
      const data = req.body;
      const { rows } = await client.query(
        format(
          "INSERT INTO %I(filter, img_src, title, summary, gallery_href, gallery_title) VALUES(%L, %L, %L, %L, %L, %L) RETURNING *",
          table,
          data.filter,
          data.imgSrc,
          data.title,
          data.summary,
          data.galleryHref,
          data.galleryTitle
        )
      );
      if (rows[0]) msg = rows[0];
      else
        msg = {
          Message: `Failed to insert the given data to table=${table}!`,
          data: data,
        };
      return msg;
    });
  });

  // Delete a row
  fastify.delete("/delete/:table/:id", tableIdOpts, async (req, res) => {
    return fastify.pg.transact(async (client) => {
      const { rows } = await client.query(
        format(
          "DELETE FROM %I WHERE id=%L RETURNING *",
          req.params.table,
          req.params.id
        )
      );
      if (rows[0]) msg = rows[0];
      else
        msg = {
          Message: `No row with id=${req.params.id} found in table=${req.params.table}!`,
        };
      return msg;
    });
  });

  // Update a row
  fastify.put("/update/:table/:id", updateTableIdOpts, async (req, res) => {
    return fastify.pg.transact(async (client) => {
      let query = format("UPDATE %I SET ", req.params.table);
      let values = [];
      Object.keys(req.body).forEach((key, index) => {
        query +=
          index == 0
            ? format("%I = %s", key.replace(/[A-Z]/g, "_$&"), `$${index + 1}`)
            : format(
                ", %I = %s",
                key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`),
                `$${index + 1}`
              );
        values.push(req.body[key]);
      });
      query += format(" WHERE id=%L RETURNING *", req.params.id);
      const { rows } = await client.query(query, values);
      if (rows[0]) msg = rows[0];
      else
        msg = {
          Message: `Failed to update row with id=${req.params.id} in table=${req.params.table} with the given data!`,
          data: req.body,
        };
      return msg;
    });
  });
}

module.exports = routes;
