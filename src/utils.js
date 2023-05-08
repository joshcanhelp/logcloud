const getOutboundHandler = () => {
  const handlerName = process.env.OUTBOUND || "console";
  const outboundHandler = require(`./outbound/${handlerName}`);
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
  getOutboundHandler,
  getCurrentDateTime,
};
