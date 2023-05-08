const fastify = require("fastify")({ logger: true });

const { getOutboundHandler } = require("./src/utils");

const { PORT: port = 3000 } = process.env;

// Health check
fastify.get("/", () => "OK");

// Configuration check
fastify.register((instance, ops, next) => {
  if (!process.env.API_KEYS) {
    next(new Error("Authorization not configured"));
  }

  try {
    fastify.log.info("Sending logs to: " + getOutboundHandler().name);
  } catch (handlerError) {
    next(new Error(handlerError.message));
  }

  next();
});

fastify.register(require("./src/routes/log"));

fastify.listen({ port }, (error) => {
  if (error) {
    fastify.log.error(error.message);
    process.exit(1);
  }
});
