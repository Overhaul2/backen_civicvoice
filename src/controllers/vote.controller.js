import { keccak256 } from "ethers";
import { hashVote } from "../utils/hash";
import { toUtf8Bytes } from "ethers";
import { votes } from "../storage/votes";


export const submitVote = async (req, res) => {
    try {
        const { userId, optionId, consultationId } = req.body;

        if (!userId || !optionId || !consultationId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const alreadyVoted = votes.find(vote => vote.userId === userId && vote.consultId === consultId);
        if (alreadyVoted) {
            return res.status(400).json({ error: "Vous avez déjà voté pour cette consultation" });
        }

        const voteHash = hashVote(userId, optionId, consultId);

        const vote = {
            userId,
            optionId,
            consultId,
            voteHash
        };

        votes.push(vote);
        res.json({ message: "Vote soumis avec succès", voteHash });
    } catch (error) {
        console.error("Error submitting vote:", error);
        res.status(500).json({ error: "Erreur lors de la soumission du vote" });
    }
}

export const submitMerkleRootController = async (req, res) => {
    try {
        const consultId = req.body.consultId;
        if (!consultId) {
            return res.status(400).json({ error: "Missing consultation ID" });
        }

        const filteredVotes = votes.filter(vote => vote.consultId === consultId);
        if (filteredVotes.length === 0) {
            return res.status(400).json({ error: "pas de votes pour cette consultation" });
        }

        const consultationBytes32 = keccak256(
            toUtf8Bytes(consultId)
        );

        const txHash = await sendMerkleRoot(consultationBytes32, root);

        return res.status(200).json({
            success: true,
            merkleRoot: root,
            totalvotes: filteredVotes.length,
            txHash,
        });
    } catch (error) {
        console.error("ereur:::::::::", error);
        return res.status(500).json({
            error: ":::::::::::::Erreur blockchain"
        })
    }

}


export const generateProofController = async (req, res) => {
    try {
        const {
            consultId, userId
        } = req.body;

        if (!consultId || !userId) {
            return res.status(400).json({
                error: "Champs manquants"
            });
        }

        const filteredVotes = votes.filter(
            v => v.consultId === consultId 
        );
    const vote =
    filteredVotes.find===(userId);
    
    const {tree}=buldMerkleTree(filteredVotes);

    const votes = filteredVotes.find(v=>v.userId===userId);

    if(!vote){
        if(!vote){
            return vote.status().json({
                error: "Vote introuvable"
            });
        }
    }

    const proof =
    tree.getHexProof(Buffer.from(vote.hashVote.slice(2),"hex"));

    return res.status(200).json({
        success: true,
      voteHash: vote.hash,
      proof
    });
    

    } catch (error) {
        console.error("::::::", Error);
        return res.status(500).json({
            Error: ":::::::: Champs manquants"
        })
    }
}