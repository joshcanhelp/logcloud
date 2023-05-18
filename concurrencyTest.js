require("dotenv").config();
const { default: axios } = require("axios");

for (let i = 0; i < 5; i++) {
  axios.post("http://localhost:3030/log", {
    actor: "a",
    text: i,
    level: "info",
  }, {
    headers: {
      "Authorization": "Bearer " + process.env.API_KEYS.split(",")[0]
    }
  });
}
