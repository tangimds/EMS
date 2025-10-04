const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const config = require("./config");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    credentials: true,
    origin: [config.APP_URL],
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ message: "Server is running!" });
});

console.log("🔍 ~ 1:");

app.use(passport.initialize());
require("./services/passport")(app);

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/experiments", require("./routes/experiments"));

// Connect to MongoDB
mongoose
  .connect(
    config.MONGO_URL || "mongodb://localhost:27017/experiment-management",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
