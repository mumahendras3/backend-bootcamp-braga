const { messageSchema } = require("../schema/common");
const { userCredentialSchema, token } = require("../schema/auth");
const argon2 = require("argon2");

async function routes(fastify, options) {
  fastify.post(
    "/signup",
    {
      schema: {
        tags: ["Auth"],
        response: {
          200: {
            ...token,
            description: "Successfully created a new account",
          },
          400: {
            ...messageSchema,
            description:
              "Failed to create a new account with the given email and password",
          },
        },
        body: userCredentialSchema,
      },
    },
    async (req, res) => {
      const { email, password } = req.body;
      const hashed_password = await argon2.hash(password);
      const {
        rows,
      } = await fastify.pg.query(
        "INSERT INTO user_auth (email, hashed_password) VALUES ($1, $2) RETURNING email",
        [email, hashed_password]
      );
      if (rows.length)
        return { token: fastify.jwt.sign({ email: rows[0].email }) };
      else {
        res.code(400);
        return {
          message: `Failed to create a new account with email: ${email}`,
        };
      }
    }
  );

  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        response: {
          200: {
            ...token,
            description: "Successfully logged in",
          },
          400: {
            ...messageSchema,
            description: "Failed to login with the given email and password",
          },
        },
        body: userCredentialSchema,
      },
    },
    async (req, res) => {
      const { email, password } = req.body;
      const {
        rows,
      } = await fastify.pg.query(
        "SELECT hashed_password FROM user_auth WHERE email=$1",
        [email]
      );
      if (rows.length === 0) {
        res.code(400);
        return { message: `${email} is not registered` };
      } else if (!(await argon2.verify(rows[0].hashed_password, password))) {
        res.code(400);
        return { message: `Incorrect password for ${email}` };
      }

      return { token: fastify.jwt.sign({ email }) };
    }
  );
}

module.exports = routes;
