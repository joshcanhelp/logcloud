const authorization = (request, response, done) => {
  const { API_KEYS } = process.env;

  const authorizationHeader = (request.headers.authorization || "").split(" ");
  const authorizationType = authorizationHeader[0].toLowerCase();
  const authorizationKey = authorizationHeader[1];
  if (authorizationType !== "bearer" || !authorizationKey) {
    const error = new Error("Request is missing valid authorization");
    error.statusCode = 400;
    return done(error);
  }

  const apiKeyList = API_KEYS.split(",").map((key) => key.trim());
  if (!apiKeyList.includes(authorizationKey)) {
    const error = new Error("Invalid API key");
    error.statusCode = 401;
    return done(error);
  }

  done();
};

module.exports = {
  authorization,
};
