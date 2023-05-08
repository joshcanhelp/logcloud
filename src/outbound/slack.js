const axios = require("axios");
const fastify = require("fastify");

const levelColors = {
  debug: "#D5DBDB",
  info: "#5DADE2",
  success: "#2ECC71",
  warn: "#F7DC6F",
  error: "#E67E22",
  fatal: "#E74C3C",
};

const prepareSlackMsg = (log) => {
  const message = {
    title: `Level: ${log.level.toUpperCase()}`,
    text:
      "Actor `" +
      log.actor +
      "`" +
      (log.component ? " > `" + log.component + "`" : "") +
      " says:\n" +
      log.text,
    color: levelColors[log.level],
  };

  if (log.transaction) {
    message.fields = [
      {
        title: "Transaction ID:",
        value: log.transaction,
      },
    ];
  }

  return message;
};

exports.default = async (log) => {
  const slackResponse = await axios.post(
    process.env.SLACK_WEBHOOK_URL,
    JSON.stringify({ attachments: [prepareSlackMsg(log)] }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return slackResponse.data;
};
