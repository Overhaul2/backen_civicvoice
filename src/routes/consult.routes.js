const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

const consultController = require('../controllers/consultController');

/**
 * @swagger
 * tags:
 *   name: Consultation
 *   description: Gestion des consultations citoyennes
 */


/**
 * @swagger
 * /api/consult/add:
 *   post:
 *     summary: Créer une nouvelle consultation
 *     tags:
 *       - Consultation
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
 *               - startAt
 *               - endAt
 *             properties:
 *               title:
 *                 type: string
 *                 example: Projet communautaire
 *
 *               description:
 *                 type: string
 *                 example: Sélection du prochain projet à financer
 *
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-10T08:00:00.000Z
 *
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-20T18:00:00.000Z
 *
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: Construction d’un forage
 *
 *     responses:
 *       201:
 *         description: Consultation créée avec succès
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
router.post('/add', authenticate, isAdmin, consultController.create);


/**
 * @swagger
 * /api/consult/update/{id}:
 *   put:
 *     summary: Mettre à jour une consultation via son ID
 *     tags:
 *       - Consultation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la consultation
 *         schema:
 *           type: string
 *           example: 02118281-2fb4-45dc-9136-502b85eaaa6f
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Projet communautaire mis à jour
 *
 *               description:
 *                 type: string
 *                 example: Nouvelle description du projet
 *
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - OUVERTE
 *                   - FERMEE
 *                   - ARCHIVEE
 *                 example: OUVERTE
 *
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-10T08:00:00.000Z
 *
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-05-20T18:00:00.000Z
 *
 *     responses:
 *       200:
 *         description: Consultation mise à jour avec succès
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
 *         description: Consultation introuvable
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.put('/update/:id', authenticate, isAdmin, consultController.update);


/**
 * @swagger
 * /api/consult/delete/{id}:
 *   delete:
 *     summary: Supprimer une consultation via son ID
 *     tags:
 *       - Consultation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la consultation
 *         schema:
 *           type: string
 *           example: 02118281-2fb4-45dc-9136-502b85eaaa6f
 *
 *     responses:
 *       200:
 *         description: Consultation supprimée avec succès
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 *
 *       404:
 *         description: Consultation introuvable
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.delete('/delete/:id', authenticate, isAdmin, consultController.remove);


/**
 * @swagger
 * /api/consult/allConsult:
 *   get:
 *     summary: Récupérer toutes les consultations
 *     tags:
 *       - Consultation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Liste des consultations
 *
 *       401:
 *         description: Non authentifié
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.get('/allConsult', authenticate, consultController.getAll);


/**
 * @swagger
 * /api/consult/findById/{id}:
 *   get:
 *     summary: Récupérer une consultation via son ID
 *     tags:
 *       - Consultation
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la consultation
 *         schema:
 *           type: string
 *           example: 02118281-2fb4-45dc-9136-502b85eaaa6f
 *
 *     responses:
 *       200:
 *         description: Consultation trouvée
 *
 *       401:
 *         description: Non authentifié
 *
 *       404:
 *         description: Consultation introuvable
 *
 *       500:
 *         description: Erreur interne serveur
 */
router.get('/findById/:id', authenticate, consultController.getOne);

/**
 * @swagger
 * /api/consult/close/{consultId}:
 *   post:
 *     summary: Clôturer une consultation et ancrer les résultats sur la blockchain
 *     description: Met fin à la période de vote, calcule la racine de Merkle et soumet l'ancrage cryptographique sur la blockchain.
 *     tags:
 *       - Consultation
 *     security:
 *       - bearerAuth: []
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
 *                 description: L'identifiant unique de la consultation à fermer
 *                 example: 65f123abc456def789
 *     responses:
 *       200:
 *         description: Consultation fermée et ancrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Consultation fermée et ancrée avec succès"
 *                 txHash:
 *                   type: string
 *                   description: Hash de la transaction blockchain
 *                   example: "0x74ba...f31a"
 *                 blockNumber:
 *                   type: integer
 *                   description: Numéro du bloc contenant la transaction
 *                   example: 154230
 *                 votesAnchored:
 *                   type: integer
 *                   description: Nombre de votes inclus dans l'ancrage
 *                   example: 150
 *                 rootHash:
 *                   type: string
 *                   description: Racine de l'arbre de Merkle ancrée
 *                   example: "a1b2c3d4..."
 *       400:
 *         description: Requête invalide (ID manquant ou consultation déjà fermée)
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur lors du processus d'ancrage blockchain
 */
router.post('/close/:consultId', authenticate, consultController.closeConsultationController);

/**
 * @swagger
 * /api/consult/addConsultOnChain/{consultId}:
 *   post:
 *     summary: Créer une consultation sur la blockchain
 *     tags:
 *       - Consultation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la consultation
 *         schema:
 *           type: string
 *           example: 02118281-2fb4-45dc-9136-502b85eaaa6f
 *     responses:
 *       200:
 *         description: Consultation créée sur la blockchain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 txHash:
 *                   type: string
 *                   description: Hash de la transaction blockchain
 *                   example: "0x74ba...f31a"
 *       400:
 *         description: Requête invalide (ID manquant)
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur lors du processus de création sur la blockchain
 */
router.post("/addConsultOnChain/:consultId", authenticate, consultController.createConsultationBlockchainController);

module.exports = router;
