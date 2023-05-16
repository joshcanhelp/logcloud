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

const preFlight = (log) => {
  if (!process.env.SLACK_WEBHOOK_URL) {
    throw new Error("SLACK_WEBHOOK_URL not defined in env");
  }
  new URL(process.env.SLACK_WEBHOOK_URL);
};

const handle = async (log) => {
  logCache.set(log);

  if (logCache.isLocked()) {
    return;
  }

  logCache.lock();

  let slackResponse;
  let processLog = logCache.getOldest();
  while (processLog) {
    try {
      slackResponse = await axios.post(
        process.env.SLACK_WEBHOOK_URL,
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
