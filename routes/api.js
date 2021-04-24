// Additional plugin to safely create dynamic SQL queries
const format = require("pg-format");
const {
  paramsSchema,
  portfolioItemSchema,
  messageSchema,
} = require("../schema/portfolio-items");

async function routes(fastify, options) {
  // List available rows from portfolio_items table in an array
  fastify.get(
    "/portfolio_items",
    {
      schema: {
        tags: ["Portfolio Items"],
        response: {
          "5xx": {
            ...messageSchema,
            description: "Failed to list all portfolio items",
          },
        },
      },
    },
    async (req, res) => {
      const { rows } = await fastify.pg.query("SELECT * FROM portfolio_items");
      return rows;
    }
  );

  // List specific row from portfolio_items table
  fastify.get(
    "/portfolio_items/:id",
    {
      schema: {
        params: paramsSchema,
        tags: ["Portfolio Items"],
        response: {
          "5xx": {
            ...messageSchema,
            description: "Failed to list the portfolio items",
          },
        },
      },
    },
    async (req, res) => {
      const {
        rows,
      } = await fastify.pg.query("SELECT * FROM portfolio_items WHERE id=$1", [
        req.params.id,
      ]);
      if (rows[0]) return rows[0];
      else {
        res.code(500);
        return {
          message: `No item with id=${req.params.id} found`,
        };
      }
    }
  );

  // Insert a new row
  fastify.post(
    "/portfolio_items/insert",
    {
      schema: {
        body: { type: "array", items: portfolioItemSchema },
        tags: ["Portfolio Items"],
        response: {
          "5xx": {
            ...messageSchema,
            description: "Failed to insert the given data",
          },
        },
      },
    },
    async (req, res) => {
      return fastify.pg.transact(async (client) => {
        let index = 0;
        let values = [];
        let query =
          "INSERT INTO portfolio_items(filter, img_src, title, summary, gallery_href, gallery_title) VALUES";
        req.body.forEach((portfolioItem, i) => {
          const {
            filter,
            imgSrc,
            title,
            summary,
            galleryHref,
            galleryTitle,
          } = portfolioItem;
          query +=
            i == 0
              ? ` ($${++index}, $${++index}, $${++index}, $${++index}, $${++index}, $${++index})`
              : `, ($${++index}, $${++index}, $${++index}, $${++index}, $${++index}, $${++index})`;
          values.push(
            filter,
            imgSrc,
            title,
            summary,
            galleryHref,
            galleryTitle
          );
        });
        query += " RETURNING *";
        const { rows } = await client.query(query, values);
        if (rows.length)
          return {
            message: `Successfully inserted ${rows.length} ${
              rows.length < 2 ? "item" : "items"
            }`,
            inserted: rows,
          };
        else {
          res.code(500);
          return {
            message: "Failed to insert the given data",
            data: req.body,
          };
        }
      });
    }
  );

  // Delete a row
  fastify.delete(
    "/portfolio_items/delete/:id",
    {
      schema: {
        params: paramsSchema,
        tags: ["Portfolio Items"],
        response: {
          "5xx": {
            ...messageSchema,
            description: "Failed to delete the portfolio item",
          },
        },
      },
    },
    async (req, res) => {
      return fastify.pg.transact(async (client) => {
        const {
          rows,
        } = await client.query(
          "DELETE FROM portfolio_items WHERE id=$1 RETURNING *",
          [req.params.id]
        );
        if (rows.length)
          return {
            message: `Successfully deleted item with id=${req.params.id}`,
            deleted: rows[0],
          };
        else {
          res.code(500);
          return {
            message: `No item with id=${req.params.id} found`,
          };
        }
      });
    }
  );

  // Update a row
  fastify.put(
    "/portfolio_items/update/:id",
    {
      schema: {
        params: paramsSchema,
        body: { ...portfolioItemSchema, required: [] },
        tags: ["Portfolio Items"],
        response: {
          "5xx": {
            ...messageSchema,
            description: "Failed to update the portfolio item",
          },
        },
      },
    },
    async (req, res) => {
      return fastify.pg.transact(async (client) => {
        let values = [];
        let query = "UPDATE portfolio_items SET";
        Object.keys(req.body).forEach((key, index) => {
          query +=
            index == 0
              ? format(" %I = $%s", key.replace(/[A-Z]/g, "_$&"), index + 1)
              : format(
                  ", %I = $%s",
                  key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`),
                  index + 1
                );
          values.push(req.body[key]);
        });
        query += ` WHERE id=$${Object.keys(req.body).length + 1} RETURNING *`;
        values.push(req.params.id);
        const { rows } = await client.query(query, values);
        if (rows.length)
          return {
            message: `Successfully updated item with id=${req.params.id}`,
            updated: rows[0],
          };
        else {
          res.code(500);
          return {
            message: `Failed to update item with id=${req.params.id} using the given data`,
            data: req.body,
          };
        }
      });
    }
  );
}

module.exports = routes;
