const getOutboundHandler = () => {
  const handlerName = process.env.OUTBOUND || "console"
  const outboundHandler = require(`./outbound/${handlerName}`);
  if (typeof outboundHandler.preFetch === "function") {
    outboundHandler.preFetch();
  }
  return outboundHandler;
}

module.exports = {
  getOutboundHandler
}