const logCache = require("../logCache");

const handle = async (log) => {
  logCache.set(log);
};

module.exports = {
  name: "In-memory",
  handle,
};
