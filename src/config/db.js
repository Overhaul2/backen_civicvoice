// const dotenv = require("dotenv");
// dotenv.config();

// const { PrismaClient } = require("@prisma/client");
// const { PrismaPg } = require("@prisma/adapter-pg");
// const pkg = require("pg");

// const { Pool } = pkg;


// // validation du variable environnement
// // if (!process.env.DATABASE_URL) {
// //   throw new Error(
// //     "DATABASE_URL manquant dans .env"
// //   );
// // }

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,

//   // sécurité SSL production
//   ssl:
//     process.env.NODE_ENV === "production"
//       ? { rejectUnauthorized: false }
//       : false,
//   // optimisation pool
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 10000
// });



// const adapter = new PrismaPg(pool);

// // Prisma avec adapter
// const prisma = new PrismaClient({
//   adapter, log:
//     process.env.NODE_ENV === "development"
//       ? ["query", "warn", "error"]
//       : ["error"]
// });

// const connectDB = async () => {
//   try {
//     await prisma.$connect();
//     console.log("DB connectée");
//   } catch (error) {
//     console.error(
//       "::::::::::::Erreur connexion DB:",
//       error
//     );
//     process.exit(1);
//   }

// };

// const disconnectDB = async () => {
//   try {
//     await prisma.$disconnect();
//     await pool.end();
//     console.log("DB déconnectée");
//   } catch (error) {
//     console.error(
//       ":::::::: Erreur fermeture DB:",
//       error
//     );
//   }

// };


// // CLEAN SHUTDOWN

// process.on("SIGINT", async () => {

//   console.log(
//     "\n Arrêt serveur..."
//   );

//   await disconnectDB();

//   process.exit(0);
// });

// process.on("SIGTERM", async () => {

//   console.log(
//     "\n SIGTERM reçu..."
//   );

//   await disconnectDB();

//   process.exit(0);
// });


// module.exports = {
//   prisma,
//   connectDB,
//   disconnectDB,
// };


const { PrismaClient } = require("@prisma/client");

const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = { prisma };