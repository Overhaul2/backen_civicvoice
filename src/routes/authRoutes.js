const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Authentification et gestion des utilisateurs
 */


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d’un utilisateur
 *     tags:
 *       - Users
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user243@civicvoice.ml
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123@
 *
 *               walletAddress:
 *                 type: string
 *                 example: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F
 *
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *
 *       400:
 *         description: Données invalides
 *
 *       409:
 *         description: Utilisateur déjà existant
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.post(
    '/register',
    authController.register
);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags:
 *       - Users
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user243@civicvoice.ml
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123@
 *
 *     responses:
 *       200:
 *         description: Connexion réussie
 *
 *       400:
 *         description: Données invalides
 *
 *       401:
 *         description: Email ou mot de passe incorrect
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.post(
    '/login',
    authController.login
);


/**
 * @swagger
 * /api/auth/all:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags:
 *       - Users
 *
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.get(
    "/all",
    authController.getAllUser
);

module.exports = router;