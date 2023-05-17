const axios = require("axios");

const logCache = require("../logCache");

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

const preFlight = () => {
  if (!process.env.URL_SLACK_WEBHOOK) {
    throw new Error("URL_SLACK_WEBHOOK not defined in env");
  }
  new URL(process.env.URL_SLACK_WEBHOOK);
};

const handle = async (log) => {
  logCache.set(log);
  if (logCache.isLocked()) {
    return;
  }
  logCache.lock();

  let processLog = logCache.getOldest();
  while (processLog) {
    try {
      await axios.post(
        process.env.URL_SLACK_WEBHOOK,
        JSON.stringify({ attachments: [prepareSlackMsg(processLog)] }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      logCache.pop();
      processLog = logCache.getOldest();
    } finally {
      logCache.unlock();
    }
  }
};

module.exports = {
  name: "Slack WebHook",
  preFlight,
  handle,
};
