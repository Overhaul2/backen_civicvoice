
const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();

const consultController = require('../controllers/consultController');


/**
 * @swagger
 * /api/consult/add:
 *   post:
 *     summary: creat  consultation
 *     tags:
 *       - consultation
 *     responses:
 *       200:
 *         description: Succès
 */
router.post('/add',authenticate,isAdmin,consultController.create);
/**
 * @swagger
 * /api/consult/update/:id:
 *   put:
 *     summary: update consultation a travers son id
 *     tags:
 *       - consultation
 *     responses:
 *       200:
 *         description: Succès
 */
router.put('/update/:id',authenticate,isAdmin,consultController.update);
/**
 * @swagger
 * /api/consult/delete/:id:
 *   delete:
 *     summary: delete consultation a travers son id
 *     tags:
 *       - consultation
 *     responses:
 *       200:
 *         description: Succès
 */
router.delete('/delete/:id',authenticate,isAdmin,consultController.remove);


//publique 
/**
 * @swagger
 * /api/consult/allConsult:
 *   get:
 *     summary: get all consultation
 *     tags:
 *       - consultation
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/allConsult',consultController.getAll);
/**
 * @swagger
 * /api/consult/findById/:id:
 *   get:
 *     summary: get all consultation
 *     tags:
 *       - consultation
 *     responses:
 *       200:
 *         description: Succès
 */
router.get('/findById/:id',consultController.getOne);

module.exports = router;