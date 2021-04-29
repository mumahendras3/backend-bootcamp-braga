// Additional plugin to safely create dynamic SQL queries
const format = require("pg-format");
const QueryStream = require("pg-query-stream");
const JSONStream = require("JSONStream");
const { messageSchema, paramsSchema } = require("../schema/common");
const { portfolioItemSchema } = require("../schema/portfolio-items");
const { resumeEntrySchema } = require("../schema/resume-entries");

async function routes(fastify, options) {
  /* Portfolio Items */
  // List available items
  fastify.get(
    "/portfolio_items",
    {
      schema: {
        tags: ["Portfolio Items"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                filter: { type: "string" },
                img_src: { type: "string" },
                title: { type: "string" },
                summary: { type: "string" },
                gallery_href: { type: "string" },
                gallery_title: { type: "string" },
              },
            },
            description: "Successfully returned the list of portfolio items",
          },
        },
      },
    },
    async (req, res) => {
      const client = await fastify.pg.connect();
      const query = new QueryStream("SELECT * FROM portfolio_items");
      const stream = client.query(query);
      //release the client when the stream is finished
      stream.on("end", client.release);
      res.header("Content-Type", "application/json");
      return stream.pipe(JSONStream.stringify());
    }
  );

  // List specific item
  fastify.get(
    "/portfolio_items/:id",
    {
      schema: {
        params: paramsSchema,
        tags: ["Portfolio Items"],
        response: {
          210: {
            ...messageSchema,
            description: "No item with the specified id found",
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
      if (rows.length) return rows[0];
      else {
        res.code(210);
        return {
          message: `No item with id=${req.params.id} found`,
        };
      }
    }
  );

  // Insert a new item
  fastify.post(
    "/portfolio_items/insert",
    {
      preValidation: [fastify.authenticate],
      schema: {
        security: [{ Bearer: [] }],
        body: { type: "array", items: portfolioItemSchema },
        tags: ["Portfolio Items"],
        response: {
          400: {
            ...messageSchema,
            properties: {
              ...messageSchema.properties,
              data: {
                type: "array",
                items: { ...portfolioItemSchema, required: [] },
              },
            },
            description: "Failed to insert the given data",
          },
          403: {
            ...messageSchema,
            description: "Not authorized for the given action",
          },
        },
      },
    },
    async (req, res) => {
      if (req.user.email !== fastify.config.ADMIN_EMAIL) {
        res.code(403);
        return { message: "You are not allowed to perform this action" };
      }
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
          res.code(400);
          return {
            message: "Failed to insert the given data",
            data: req.body,
          };
        }
      });
    }
  );

  // Delete an item
  fastify.delete(
    "/portfolio_items/delete/:id",
    {
      preValidation: [fastify.authenticate],
      schema: {
        security: [{ Bearer: [] }],
        params: paramsSchema,
        tags: ["Portfolio Items"],
        response: {
          210: {
            ...messageSchema,
            description: "No item with the specified id found",
          },
          403: {
            ...messageSchema,
            description: "Not authorized for the given action",
          },
        },
      },
    },
    async (req, res) => {
      if (req.user.email !== fastify.config.ADMIN_EMAIL) {
        res.code(403);
        return { message: "You are not allowed to perform this action" };
      }
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
          res.code(210);
          return {
            message: `No item with id=${req.params.id} found`,
          };
        }
      });
    }
  );

  // Update an item
  fastify.put(
    "/portfolio_items/update/:id",
    {
      preValidation: [fastify.authenticate],
      schema: {
        security: [{ Bearer: [] }],
        params: paramsSchema,
        body: { ...portfolioItemSchema, required: [] },
        tags: ["Portfolio Items"],
        response: {
          400: {
            ...messageSchema,
            properties: {
              ...messageSchema.properties,
              data: {
                ...portfolioItemSchema,
                required: [],
              },
            },
            description:
              "Failed to update item with the specified id using the given data",
          },
          403: {
            ...messageSchema,
            description: "Not authorized for the given action",
          },
        },
      },
    },
    async (req, res) => {
      if (req.user.email !== fastify.config.ADMIN_EMAIL) {
        res.code(403);
        return { message: "You are not allowed to perform this action" };
      }
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
          res.code(400);
          return {
            message: `Failed to update item with id=${req.params.id} using the given data`,
            data: req.body,
          };
        }
      });
    }
  );

  /* Resume Entries */
  // List available entries
  fastify.get(
    "/resume_entries",
    {
      schema: {
        tags: ["Resume Entries"],
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                column: { type: "number" },
                title: { type: "string" },
                items: { type: "array", items: { type: "string" } },
              },
            },
            description: "Successfully returned the list of resume entries",
          },
        },
      },
    },
    async (req, res) => {
      const client = await fastify.pg.connect();
      const query = new QueryStream("SELECT * FROM resume_entries");
      const stream = client.query(query);
      //release the client when the stream is finished
      stream.on("end", client.release);
      res.header("Content-Type", "application/json");
      return stream.pipe(JSONStream.stringify());
    }
  );

  // List specific entry
  fastify.get(
    "/resume_entries/:id",
    {
      schema: {
        params: paramsSchema,
        tags: ["Resume Entries"],
        response: {
          210: {
            ...messageSchema,
            description: "No entry with the specified id found",
          },
        },
      },
    },
    async (req, res) => {
      const {
        rows,
      } = await fastify.pg.query("SELECT * FROM resume_entries WHERE id=$1", [
        req.params.id,
      ]);
      if (rows.length) return rows[0];
      else {
        res.code(210);
        return {
          message: `No entry with id=${req.params.id} found`,
        };
      }
    }
  );

  // Insert a new entry
  fastify.post(
    "/resume_entries/insert",
    {
      preValidation: [fastify.authenticate],
      schema: {
        security: [{ Bearer: [] }],
        body: { type: "array", items: resumeEntrySchema },
        tags: ["Resume Entries"],
        response: {
          400: {
            ...messageSchema,
            properties: {
              ...messageSchema.properties,
              data: {
                type: "array",
                items: { ...resumeEntrySchema, required: [] },
              },
            },
            description: "Failed to insert the given data",
          },
          403: {
            ...messageSchema,
            description: "Not authorized for the given action",
          },
        },
      },
    },
    async (req, res) => {
      if (req.user.email !== fastify.config.ADMIN_EMAIL) {
        res.code(403);
        return { message: "You are not allowed to perform this action" };
      }
      return fastify.pg.transact(async (client) => {
        let index = 0;
        let values = [];
        let query = 'INSERT INTO resume_entries("column", title, items) VALUES';
        req.body.forEach((resumeEntry, i) => {
          const { column, title, items } = resumeEntry;
          query +=
            i == 0
              ? ` ($${++index}, $${++index}, $${++index})`
              : `, ($${++index}, $${++index}, $${++index})`;
          values.push(column, title, items);
        });
        query += " RETURNING *";
        const { rows } = await client.query(query, values);
        if (rows.length)
          return {
            message: `Successfully inserted ${rows.length} ${
              rows.length < 2 ? "entry" : "entries"
            }`,
            inserted: rows,
          };
        else {
          res.code(400);
          return {
            message: "Failed to insert the given data",
            data: req.body,
          };
        }
      });
    }
  );

  // Delete an entry
  fastify.delete(
    "/resume_entries/delete/:id",
    {
      preValidation: [fastify.authenticate],
      schema: {
        security: [{ Bearer: [] }],
        params: paramsSchema,
        tags: ["Resume Entries"],
        response: {
          210: {
            ...messageSchema,
            description: "No entry with the specified id found",
          },
          403: {
            ...messageSchema,
            description: "Not authorized for the given action",
          },
        },
      },
    },
    async (req, res) => {
      if (req.user.email !== fastify.config.ADMIN_EMAIL) {
        res.code(403);
        return { message: "You are not allowed to perform this action" };
      }
      return fastify.pg.transact(async (client) => {
        const {
          rows,
        } = await client.query(
          "DELETE FROM resume_entries WHERE id=$1 RETURNING *",
          [req.params.id]
        );
        if (rows.length)
          return {
            message: `Successfully deleted entry with id=${req.params.id}`,
            deleted: rows[0],
          };
        else {
          res.code(210);
          return {
            message: `No entry with id=${req.params.id} found`,
          };
        }
      });
    }
  );

  // Update an entry
  fastify.put(
    "/resume_entries/update/:id",
    {
      preValidation: [fastify.authenticate],
      schema: {
        security: [{ Bearer: [] }],
        params: paramsSchema,
        body: { ...resumeEntrySchema, required: [] },
        tags: ["Resume Entries"],
        response: {
          400: {
            ...messageSchema,
            properties: {
              ...messageSchema.properties,
              data: {
                ...resumeEntrySchema,
                required: [],
              },
            },
            description:
              "Failed to update entry with the specified id using the given data",
          },
          403: {
            ...messageSchema,
            description: "Not authorized for the given action",
          },
        },
      },
    },
    async (req, res) => {
      if (req.user.email !== fastify.config.ADMIN_EMAIL) {
        res.code(403);
        return { message: "You are not allowed to perform this action" };
      }
      return fastify.pg.transact(async (client) => {
        let values = [];
        let query = "UPDATE resume_entries SET";
        Object.keys(req.body).forEach((key, index) => {
          query +=
            index == 0
              ? format(" %I = $%s", key, index + 1)
              : format(", %I = $%s", key, index + 1);
          values.push(req.body[key]);
        });
        query += ` WHERE id=$${Object.keys(req.body).length + 1} RETURNING *`;
        values.push(req.params.id);
        const { rows } = await client.query(query, values);
        if (rows.length)
          return {
            message: `Successfully updated entry with id=${req.params.id}`,
            updated: rows[0],
          };
        else {
          res.code(400);
          return {
            message: `Failed to update entry with id=${req.params.id} using the given data`,
            data: req.body,
          };
        }
      });
    }
  );

  // Testing
  // fastify.get("/test", async (req, res) => {
  //   const client = await fastify.pg.connect();
  //   const query = new QueryStream("SELECT * FROM generate_series(0, $1) num", [
  //     1000,
  //   ]);
  //   const stream = client.query(query);
  //   //release the client when the stream is finished
  //   stream.on("end", client.release);
  //   res.header("Content-Type", "application/json");
  //   return stream.pipe(JSONStream.stringify());
  // });
}

module.exports = routes;
