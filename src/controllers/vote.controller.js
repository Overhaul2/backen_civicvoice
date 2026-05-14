const { keccak256, toUtf8Bytes, solutils } = require("ethers");
const { hashVote } = require("../utils/hash");
const { votes } = require("../storage/votes");
const { prisma } = require("../config/db");
const SubmitVoteDTO = require("../utils/dto/vote.submit.dto");
const sendUserVoteConfirmation = require("../services/notification.service");


const submitVote = async (req, res) => {
    try {
        const dto = new SubmitVoteDTO(req.body);
        console.log(":::::::::DTO:", dto);
        const validation = dto.validate();

        const userId = req.user.id;

        // Récupération de l'utilisateur et de son walletAddress
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                walletAddress: true,
                // isVerified: true,
                isActive: true
            }
        });

        // Sécurité : Vérifier si l'utilisateur peut voter
        // if (!user || !user.walletAddress) {
        //     return res.status(403).json({ error: "Compte non lié à un portefeuille blockchain" });
        // }
        // if (!user.isVerified) {
        //     return res.status(403).json({ error: "Votre compte n'est pas encore vérifié (CNI requise)" });
        // }

        // Vérification de l'existence et de l'état de la consultation
        const consultation = await prisma.consultation.findUnique({
            where: { id: dto.consultationId },
        });

        if (!consultation) {
            return res.status(404).json({ error: "Consultation introuvable" });
        }

        if (consultation.status !== "OUVERTE") {
            return res.status(400).json({ error: "Cette consultation n'est plus ouverte aux votes" });
        }

        // On utilise walletAddress + consultationId + Secret pour garantir l'unicité blockchain
        const nullifier = keccak256(
            toUtf8Bytes(`${user.walletAddress.toLowerCase()}-${dto.consultationId}-${process.env.VOTE_SECRET}`)
        );

        //Génération du Hash du vote pour l'arbre de Merkle
        //On ajoute un timestamp ou un sel pour que deux votes pour la même option n'aient pas le même hash
        const voteHash = keccak256(
            toUtf8Bytes(`${dto.optionId}-${nullifier}-${Date.now()}`)
        );

        //Enregistrement dans la base de données
        //Prisma gérera l'unicité grâce à la contrainte @@unique([userId, consultationId])
        const vote = await prisma.vote.create({
            data: {
                userId,
                optionId: dto.optionId,
                consultationId: dto.consultationId,
                nullifier,
                hashVote: voteHash,
            }
        });
        // sendUserVoteConfirmation(user.email, consultation.title, voteHash);
        return res.status(201).json({
            success: true,
            message: "Votre vote a été enregistré avec succès",
            data: {
                voteId: vote.id,
                hash: vote.hashVote
            }
        });
    } catch (error) {
        // Gestion de l'erreur de validation du DTO
        if (error.message.includes("requis")) {
            return res.status(400).json({ error: error.message });
        }
        // Gestion de la contrainte d'unicité Prisma (P2002)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Vous avez déjà voté pour cette consultation" });
        }
        console.error("Erreur Vote Submit:", error);
        return res.status(500).json({ error: "Une erreur interne est survenue" });
    }
}

const submitMerkleRootController = async (req, res) => {
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


const generateProofController = async (req, res) => {
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
            filteredVotes.find === (userId);

        const { tree } = buldMerkleTree(filteredVotes);

        const votes = filteredVotes.find(v => v.userId === userId);

        if (!vote) {
            if (!vote) {
                return vote.status().json({
                    error: "Vote introuvable"
                });
            }
        }

        const proof =
            tree.getHexProof(Buffer.from(vote.hashVote.slice(2), "hex"));

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


const getUserProofController = async (req, res) => {
    try {
        const { consultationId } = req.params;
        const userId = req.user.id;

        //  Récupérer tous les votes de la consultation pour reconstruire l'arbre
        const allVotes = await prisma.vote.findMany({
            where: { consultationId },
            orderBy: { createdAt: 'asc' } // L'ordre doit être constant
        });

        // Trouver le vote spécifique de cet utilisateur
        const userVote = allVotes.find(v => v.userId === userId);

        if (!userVote) {
            return res.status(404).json({ error: "Vote non trouvé pour cet utilisateur" });
        }

        // Vérifier si la racine est déjà ancrée sur la blockchain
        const merkleRoot = await prisma.merkleRoot.findUnique({
            where: { consultationId }
        });

        if (!merkleRoot) {
            return res.status(400).json({ error: "La consultation n'est pas encore ancrée sur la blockchain" });
        }

        // Générer la preuve
        const proofData = getVoteProof(allVotes, userVote.hashVote);

        res.json({
            success: true,
            txHash: merkleRoot.txHash, // Hash de la transaction Polygon Amoy
            blockRoot: merkleRoot.rootHash, // Racine stockée sur le smart contract
            userProof: proofData.proof, // Tableau de preuves pour le mobile
            voteHash: userVote.hashVote // Le hash du vote de l'utilisateur
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    submitVote, submitMerkleRootController, generateProofController, getUserProofController
}