

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

// Routes
const authRoute = require("./routes/authRoutes");
const consultRoute = require("./routes/consult.routes");
const voteRoute = require("./routes/vote.routes");
const engRoute = require("./routes/eng.routes");

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));

app.use(express.json({ limit: '15mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Trop de requêtes, réessaye plus tard."
});

// Swagger docs
app.use(
  "/api-docs",
  limiter,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/consult", consultRoute);
app.use("/api/eng", engRoute);
app.use("/api/vote", voteRoute);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CivicVoice API OK" });
});

module.exports = app;