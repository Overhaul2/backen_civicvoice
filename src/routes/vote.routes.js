import { submitVote ,submitMerkleRootController,generateProofController} from "../controllers/vote.controller";


const router = express.Router();

router.post('/vote',submitVote);

router.post("submit-merkle",submitMerkleRootController);

router.post("proofs",generateProofController);

export default router;