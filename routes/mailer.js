const { messageSchema } = require("../schema/common");
const { mailSchema } = require("../schema/mails");
const nodemailer = require("nodemailer");

async function routes(fastify, options) {
  let transporter = nodemailer.createTransport({
    host: "srv80.niagahoster.com",
    port: 465,
    secure: true,
    auth: {
      user: fastify.config.BRAGA_EMAIL,
      pass: fastify.config.BRAGA_EMAIL_PASS,
    },
  });
  fastify.post(
    "/",
    {
      schema: {
        tags: ["Mailer"],
        response: {
          400: {
            ...messageSchema,
            description: "Failed to send the email",
          },
        },
        body: mailSchema,
      },
    },
    async (req, res) => {
      const {
        name: { value: name },
        email: { value: email },
        subject: { value: subject },
        message: { value: message },
      } = req.body;

      let info = await transporter.sendMail({
        from: `Braga Email Service <${fastify.config.BRAGA_EMAIL}>`,
        to: "mumahendras3@gmail.com",
        subject: subject,
        text: `Message from ${name} (${email}):\n\n${message}`,
        html: `<h4>Message from ${name} (<a href="mailto:${email}">${email}</a>):</h4><p>${message}</p>`,
      });
      if (/ OK /.test(info.response)) return "OK";
      else return "Failed to send the email";
    }
  );
}

module.exports = routes;
