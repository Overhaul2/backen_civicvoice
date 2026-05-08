
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: register d'un utilisateur
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Succès
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: login d'un utilisateur
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Succès
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/all:
 *   get:
 *     summary: Récupérer les utilisateurs
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/all", authController.getAllUser);

// export default router;
module.exports = router