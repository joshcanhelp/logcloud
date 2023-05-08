require("dotenv").config();

const { authorization } = require("../authorization");

module.exports = async (fastify, options) => {
  fastify.route({
    method: "POST",
    url: "/log",
    schema: {
      body: {
        type: "object",
        required: ["actor", "text", "level"],
        properties: {
          // required
          actor: { type: "string" },
          text: { type: "string" },
          level: {
            type: "string",
            pattern: "^debug|info|success|warn|error|fatal$",
          },
          // optional
          component: { type: "string" },
          transaction: { type: "string" },
        },
      },
    },
    preHandler: authorization,
    handler: async (request) => {
      const outboundHandler = process.env.OUTBOUND || "console";
      const response = await require(`../outbound/${outboundHandler}`).default(request.body);
      fastify.log.info(response)
      return "OK";
    },
  });
};
