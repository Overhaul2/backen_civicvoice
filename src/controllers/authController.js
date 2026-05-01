
const prisma = require('../config/prisma');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');