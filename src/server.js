const dotenv = require('dotenv');
const express = require('express');
const { connectDB, disconnectDB } = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = process.env.PORT || 5002;

// securite et parsing
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5002" || "*" }));
app.use(express.json({ limit: '5mb' })); // Limite de taille pour les requêtes JSON

// liliter les requette pour eviter les attaques de force brute
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre de temps
  message: "Trop de requêtes, veuillez réessayer dans 15 minutes."
});
app.use(
  "/api-docs",
  limiter,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);


// Middleware pour parser le JSON 
app.use(express.json());
//import des routes
const authRoute = require("./routes/authRoutes");
app.use("/api/auth", authRoute);
dotenv.config();

app.get('/', (req, res) => {
  res.send('Le serveur fonctionne correctement !');
});

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
};

startServer();

// Gestion centralisée du shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Reçu ${signal}. Fermeture en cours...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log("Serveur et Database fermés.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));


// Gestion des erreurs non capturées
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  gracefulShutdown("unhandledRejection");
});

// Gestion des exceptions non capturées
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Gestion de l'arrêt du serveur
process.on("SIGINT", async () => {
  console.log("Arrêt du serveur...");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});