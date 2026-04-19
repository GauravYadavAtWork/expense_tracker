const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const mongoUri = process.env.MONGODB_URI || process.env.DB_URL;
const requiredEnvVars = ["PORT", "JWT_SECRET"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

if (!mongoUri) {
  throw new Error("Missing required environment variable: MONGODB_URI");
}

module.exports = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
