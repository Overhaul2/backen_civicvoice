const express = require('express');

const {
  submitVote,
  submitMerkleRootController,
  generateProofController,
  getUserProofController
} = require("../controllers/vote.controller");
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Vote
 *   description: Gestion des votes blockchain et preuves Merkle
 */


/**
 * @swagger
 * /api/vote/submit:
 *   post:
 *     summary: Soumettre un vote
 *     tags:
 *       - Vote
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - optionId
 *               - consultationId
 *             properties:
 *               optionId:
 *                 type: string
 *                 example: 0fe70449-1157-4388-8a7d-36554b560ddc
 *
 *               consultationId:
 *                 type: string
 *                 example: 02118281-2fb4-45dc-9136-502b85eaaa6f
 *
 *     responses:
 *       201:
 *         description: Vote enregistré avec succès
 *
 *       400:
 *         description: Données invalides
 *
 *       401:
 *         description: Non authentifié
 *
 *       409:
 *         description: L’utilisateur a déjà voté
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.post(
  '/submit',
  authenticate,
  submitVote
);


/**
 * @swagger
 * /api/vote/submit-merkle:
 *   post:
 *     summary: Soumettre une racine Merkle à la blockchain
 *     tags:
 *       - Vote
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultationId
 *               - merkleRoot
 *             properties:
 *               consultationId:
 *                 type: string
 *                 example: 02118281-2fb4-45dc-9136-502b85eaaa6f
 *
 *               merkleRoot:
 *                 type: string
 *                 example: 0x123456abcdef7890
 *
 *     responses:
 *       200:
 *         description: Racine Merkle soumise avec succès
 *
 *       400:
 *         description: Données invalides
 *
 *       401:
 *         description: Non authentifié
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.post(
  "/submit-merkle",
  authenticate,
  submitMerkleRootController
);


/**
 * @swagger
 * /api/vote/proofs:
 *   post:
 *     summary: Générer une preuve Merkle pour un vote
 *     tags:
 *       - Vote
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultationId
 *             properties:
 *               consultationId:
 *                 type: string
 *                 example: 02118281-2fb4-45dc-9136-502b85eaaa6f
 *
 *     responses:
 *       200:
 *         description: Preuve générée avec succès
 *
 *       400:
 *         description: Données invalides
 *
 *       401:
 *         description: Non authentifié
 *
 *       404:
 *         description: Vote introuvable
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.post(
  "/proofs",
  authenticate,
  generateProofController
);


/**
 * @swagger
 * /api/vote/user-proofs/{consultationId}:
 *   get:
 *     summary: Récupérer la preuve utilisateur pour une consultation
 *     tags:
 *       - Vote
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: consultationId
 *         required: true
 *         description: ID de la consultation
 *         schema:
 *           type: string
 *           example: 02118281-2fb4-45dc-9136-502b85eaaa6f
 *
 *     responses:
 *       200:
 *         description: Preuve utilisateur récupérée avec succès
 *
 *       401:
 *         description: Non authentifié
 *
 *       404:
 *         description: Preuve introuvable
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.get(
  "/user-proofs/:consultationId",
  authenticate,
  getUserProofController
);

module.exports = router;