const prepareSlackMsg = (log) => {
    const logData = log.data || {};
    const errorDesc = logData.description || "No description";
    const errorTitle = `${errorDesc} [type: ${logData.type}]`;

    const message = {
      pretext: "*Auth0 log alert*",
      fallback: errorTitle,
      title: errorTitle,
      color: "#ff0000",
    };

    if (logData.log_id) {
      message.title_link = `https://manage.auth0.com/#/logs/${logData.log_id}`;
    }

    if (logData.client_id) {
      message.fields = [
        {
          title: "Client",
          value: `${logData.client_name || "None"}\n\`${logData.client_id}\``,
        },
      ];
    }

    return message;
  }


const outbound = async (log) => {
  const { body, headers } = req;

  if (!body || !Array.isArray(body)) {
    res.status(400);
    return res.end();
  }

  if (headers.authorization !== process.env.AUTH0_LOG_STREAM_TOKEN) {
    res.status(401);
    return res.end();
  }

  const failedLogs = body.filter((log) => {
    return "f" === log.data.type[0] || /limit/.test(log.data.type);
  });

  if (failedLogs.length === 0) {
    res.status(204);
    return res.end();
  }

  const reqUrl = process.env.SLACK_WEBHOOK_URL;
  const reqOpts = {
    json: {
      attachments: failedLogs.map((log) => prepareSlackMsg(log)),
    },
  };

  const slackResponse = await got.post(reqUrl, reqOpts);

  res.status(slackResponse.statusCode);
  return res.end(slackResponse.body);
}

module.exports = {
  outbound
}