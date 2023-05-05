// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });

const { PORT: port = 3000 } = process.env;

// Health check
fastify.get("/", () => "OK");

fastify.register(require("./src/routes/log"));

fastify.listen({ port }, (error) => {
  if (!process.env.API_KEYS) {
    fastify.log.error(new Error("Authorization not configured"));
    process.exit(1);
  }

  if (error) {
    fastify.log.error(err);
    process.exit(1);
  }
});
