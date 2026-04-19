const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}

module.exports = {
  connectDatabase,
};
