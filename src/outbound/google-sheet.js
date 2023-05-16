const { existsSync } = require("fs");
const { google } = require("googleapis");
const path = require("path");

const { getCurrentDateTime } = require("../utils");
const logCache = require("../logCache");

const { GOOGLE_SHEET_KEYS_PATH, GOOGLE_SHEET_ID } = process.env;

const preFlight = (log) => {
  if (!GOOGLE_SHEET_KEYS_PATH) {
    throw new Error("GOOGLE_SHEET_KEYS_PATH not defined in env");
  }
  if (!existsSync(path.join(process.cwd(), GOOGLE_SHEET_KEYS_PATH))) {
    throw new Error(`${GOOGLE_SHEET_KEYS_PATH} does not exist`);
  }

  if (!GOOGLE_SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID not defined in env");
  }
};

const handle = async (log) => {
  logCache.set(log);
  if (logCache.isLocked()) {
    return;
  }
  logCache.lock();

  const auth = new google.auth.GoogleAuth({
    keyFile: GOOGLE_SHEET_KEYS_PATH,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const googleSheetsInstance = google.sheets({
    version: "v4",
    auth: await auth.getClient(),
  });

  let processLog = logCache.getOldest();
  while (processLog) {
    try {
      await googleSheetsInstance.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: "Sheet1",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            [
              getCurrentDateTime(),
              log.level.toUpperCase(),
              log.actor + (log.component ? " > " + log.component : ""),
              log.text,
              log.transaction || "No transaction",
            ],
          ],
        },
      });
      logCache.pop();
      processLog = logCache.getOldest();
    } finally {
      logCache.unlock();
    }
  }
};

module.exports = {
  name: "Google Sheet",
  preFlight,
  handle,
};
