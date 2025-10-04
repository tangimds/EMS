const dotenv = require("dotenv");
dotenv.config();

const ENVIRONMENT = process.env.ENVIRONMENT || "development";
const MONGO_URL = process.env.MONGO_URL || "";
const SECRET = process.env.SECRET || "not-so-secret";
const SENTRY_URL = process.env.SENTRY_URL || "";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

const CONFIG = {
  ENVIRONMENT,
  MONGO_URL,
  SECRET,
  SENTRY_URL,
  APP_URL,
};

if (ENVIRONMENT === "development") console.log(CONFIG);

module.exports = CONFIG;
