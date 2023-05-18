const getOutboundHandlerName = () => process.env.OUTBOUND || "memory"

const getOutboundHandler = () => {
  const outboundHandler = require(`./outbound/${getOutboundHandlerName()}`);
  if (typeof outboundHandler.preFlight === "function") {
    outboundHandler.preFlight();
  }
  return outboundHandler;
};

const padLeftZero = (string) => {
  return `${string}`.length === 1 ? `0${string}` : `${string}`;
};

const getCurrentDateTime = () => {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = date.getUTCMonth() + 1;
  const dd = date.getUTCDate();

  const hour = date.getUTCHours();
  const min = date.getUTCMinutes();
  const sec = date.getUTCSeconds();

  return (
    `${yyyy}-` +
    padLeftZero(mm) +
    `-${padLeftZero(dd)} ${padLeftZero(hour)}:${padLeftZero(min)}:${padLeftZero(
      sec
    )}`
  );
};

module.exports = {
  getOutboundHandlerName,
  getOutboundHandler,
  getCurrentDateTime,
};
