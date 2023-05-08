require("dotenv").config();

const { authorization } = require("../middleware/authorization");
const { getOutboundHandler } = require("../utils");

module.exports = async (fastify, options) => {
  fastify.post("/log", {
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
    handler: async (request, reply) => {
      await getOutboundHandler().handle(request.body);
    },
  });
};
