const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

const engController = require('../controllers/eng.controller');


/**
 * @swagger
 * tags:
 *   name: Engagement
 *   description: Gestion des engagements citoyens et suivi blockchain
 */


/**
 * @swagger
 * /api/eng/add:
 *   post:
 *     summary: Créer un engagement
 *     tags:
 *       - Engagement
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
 *               - title
 *               - description
 *               - consultationId
 *             properties:
 *               title:
 *                 type: string
 *                 example: Réhabilitation des routes de Sogoniko
 *
 *               description:
 *                 type: string
 *                 example: Les travaux commenceront avant décembre 2026
 *
 *               consultationId:
 *                 type: string
 *                 example: a750b325-1385-45d4-bf9a-bc4fb5265b50
 *
 *               metadataURI:
 *                 type: string
 *                 example: ipfs://QmX123456789
 *
 *     responses:
 *       201:
 *         description: Engagement créé avec succès
 *
 *       400:
 *         description: Données invalides
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.post(
    '/add',
    authenticate,
    isAdmin,
    engController.createEngagement
);


/**
 * @swagger
 * /api/eng/update/{id}:
 *   put:
 *     summary: Mettre à jour le statut d’un engagement
 *     tags:
 *       - Engagement
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l’engagement
 *         schema:
 *           type: string
 *           example: 2a8b4fa0-6737-4f53-9fb5-10bfb3c018f0
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - EN_ATTENTE
 *                   - EN_COURS
 *                   - TERMINE
 *                 example: EN_COURS
 *
 *               progress:
 *                 type: number
 *                 example: 0.65
 *
 *     responses:
 *       200:
 *         description: Engagement mis à jour avec succès
 *
 *       400:
 *         description: Données invalides
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 *
 *       404:
 *         description: Engagement introuvable
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.put(
    '/update/:id',
    authenticate,
    isAdmin,
    engController.updateEngagementStatus
);


/**
 * @swagger
 * /api/eng/delete/{id}:
 *   delete:
 *     summary: Supprimer un engagement via son ID
 *     tags:
 *       - Engagement
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l’engagement
 *         schema:
 *           type: string
 *           example: 2a8b4fa0-6737-4f53-9fb5-10bfb3c018f0
 *
 *     responses:
 *       200:
 *         description: Engagement supprimé avec succès
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 *
 *       404:
 *         description: Engagement introuvable
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.delete(
    '/delete/:id',
    authenticate,
    isAdmin,
    engController.deleteEngagement
);


/**
 * @swagger
 * /api/eng/getAll:
 *   get:
 *     summary: Récupérer tous les engagements
 *     tags:
 *       - Engagement
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Liste des engagements
 *
 *       401:
 *         description: Non authentifié
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.get(
    '/getAll',
    authenticate,
    engController.getAllEngagements
);

module.exports = router;