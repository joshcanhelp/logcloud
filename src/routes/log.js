const { authorization } = require("../middleware/authorization");
const { getOutboundHandler, getOutboundHandlerName, getCurrentDateTime } = require("../utils");
const logCache = require("../logCache");

const { OUTBOUND } = process.env;

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
    handler: async (request) => {
      logCache.set(request.body);
      if (getOutboundHandlerName() === "memory" || logCache.isLocked()) {
        return "OK";
      }
      logCache.lock();

      const outboundHandler = getOutboundHandler();

      let processLog = logCache.shift();
      try {
        while (processLog) {
          processLog.level = processLog.level.toUpperCase();
          processLog.date = getCurrentDateTime();
          await outboundHandler.handle(processLog);
          processLog = logCache.shift();
        }
      } finally {
        logCache.unlock();
      }

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
