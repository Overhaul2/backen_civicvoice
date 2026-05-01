const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pkg = require('pg');

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// Prisma avec adapter
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
  await prisma.$connect();
  console.log("DB connectée");
};

const disconnectDB = async () => {
  await prisma.$disconnect();
  await pool.end(); // obligatoire avec adapter
  console.log("DB déconnectée");
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
};