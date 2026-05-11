
const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();

const engController = require('../controllers/eng.controller');

/**
 * @swagger
 * /api/eng/add:
 *   post:
 *     summary: creat  engagement
 *     tags:
 *       - engagement
 *     responses:
 *       200:
 *         description: Succès
 */
router.post('/add',authenticate,isAdmin,engController.create);
/**
 * @swagger
 * /api/eng/update/:id:
 *   put:
 *     summary: update engagement a travers son id
 *     tags:
 *       - engagement
 *     responses:
 *       200:
 *         description: Succès
 */
router.put('/update/:id',authenticate,isAdmin,engController.update);
/**
 * @swagger
 * /api/eng/delete/:id:
 *   delete:
 *     summary: delete engagement a travers son id
 *     tags:
 *       - engagement
 *     responses:
 *       200:
 *         description: Succès
 */
router.delete('/delete/:id',authenticate,isAdmin,engController.remove);