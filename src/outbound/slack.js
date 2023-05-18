const axios = require("axios");

const levelColors = {
  DEBUG: "#D5DBDB",
  INFO: "#5DADE2",
  SUCCESS: "#2ECC71",
  WARN: "#F7DC6F",
  ERROR: "#E67E22",
  FATAL: "#E74C3C",
};

const prepareSlackMsg = (log) => {
  const message = {
    title: `Level: ${log.level}`,
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

const preFlight = () => {
  if (!process.env.URL_SLACK_WEBHOOK) {
    throw new Error("URL_SLACK_WEBHOOK not defined in env");
  }
  new URL(process.env.URL_SLACK_WEBHOOK);
};

const handle = async (log) => {
  await axios.post(
    process.env.URL_SLACK_WEBHOOK,
    JSON.stringify({ attachments: [prepareSlackMsg(log)] }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

module.exports = {
  name: "Slack WebHook",
  preFlight,
  handle,
};
