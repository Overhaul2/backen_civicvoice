const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword,
};