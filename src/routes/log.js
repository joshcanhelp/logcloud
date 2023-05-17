const { authorization } = require("../middleware/authorization");
const { getOutboundHandler } = require("../utils");
const logCache = require("../logCache");

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
      return "OK";
    },
    onError: (request, reply, error, done) => {
      delete error.response;
      if (error.config.headers) {
        delete error.config.headers;
      }
      done(error);
    },
  });

  fastify.get("/log", {
    preHandler: authorization,
    handler: async (request, reply) => {
      reply.send(logCache.getAll());
    },
  });

  fastify.get("/log/:transaction", {
    preHandler: authorization,
    handler: async (request, reply) => {
      const { transaction } = request.params;
      reply.send(logCache.get(decodeURIComponent(transaction)));
    },
  });

  fastify.delete("/log", {
    preHandler: authorization,
    handler: async (request, reply) => {
      logCache.flush();
      return "OK";
    },
  });
};
