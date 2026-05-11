import { submitVote ,submitMerkleRootController,generateProofController} from "../controllers/vote.controller";


const router = express.Router();
/**
 * @swagger
 * /api/vote/submit:
 *   post:
 *     summary: submit a vote
 *     tags:
 *       - vote
 *     responses:
 *       200:
 *         description: Succès
 */
router.post('/submit',submitVote);

/**
 * @swagger
 * /api/vote/submit-merkle:
 *   post:
 *     summary: submit merkle root to blockchain
 *     tags:
 *       - vote
 *     responses:
 *       200:
 *         description: Succès
 */
router.post("/submit-merkle",submitMerkleRootController);

/**
 * @swagger
 * /api/vote/proofs:
 *   post:
 *     summary: generate proof for vote
 *     tags:
 *       - vote
 *     responses:
 *       200:
 *         description: Succès
 */
router.post("/proofs",generateProofController);

export default router;