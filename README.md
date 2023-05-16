# Cloud Log Router

This little guy accepts incoming log events and sends them to another service.

## Setup

Install dependencies:

```bash
$ npm install
```

Create an env file:

```bash
$ cp example.env .env
```

Generate an API key:

```bash
$ openssl rand -hex 16
569bcb828398cd03b0ce3715eb135fa3
```

Add that to the `API_KEY` in the env file.

Start the service:

```bash
$ npm start
```

Post a log event:

```bash
$ curl -i \
-d '{"actor":"Auth0 Tenant","component":"Actions","text":"This is an event that happened","transaction":"12313234534","level":"fatal"}' \
-H "Content-Type: application/json" \
-H "Authorization: Bearer f588536b232da287969b25e0fa5595b8" \
http://localhost:3000/log
```

You should see output in the application log:

```js
{
  actor: 'Auth0 Tenant',
  component: 'Actions',
  text: 'This is an event that happened',
  transaction: '12313234534',
  level: 'fatal'
}
```

**To send logs to memory:**

1. Uncomment the memory `OUTBOUND` var in the env file and adjust `MAX_LOGS_IN_MEMORY` as needed
2. Run processes that generate logs as usual
3. Make a `GET` call to the `/log` endpoint with an API key to see all the logs in memory.
4. Make a `GET` call to the `/log/{$transaction}` endpoint with an API key to see logs for a specific transaction.
5. Make a `DELETE` call to the `/log` endpoint with an API key to flush all saved logs.

**To send logs to Slack:**

1. [Create a Slack app with a WebHook URL](https://api.slack.com/messaging/webhooks).
2. Uncomment the Slack lines in the env file and add your URL.
3. Restart the application and post a log event like the example above.

![](./docs/slack-example.png)

**To send logs to a Google Sheet:**

1. [Create a Google Service account](https://cloud.google.com/iam/docs/service-accounts-create#creating).
2. [Generate and download credentials for the service account](https://cloud.google.com/iam/docs/keys-create-delete).
3. Copy or move the credentials to a `.google.json` file in the root of the application.
4. [Enable the Sheets API](https://cloud.google.com/apis/docs/getting-started#enabling_apis).
5. Create a new Google Sheet and share it with the `client_email` address in the credentials.
6. Uncomment the Google lines in the env file and add your Sheet ID; comment out any other `OUTBOUND` lines.
7. Restart the application and post a log event like the example above.
8. The Google Sheet should be appended with a new row with:
   - Date and time (UTC)
   - Event type
   - Actor + component
   - Event message
   - Transaction
