const { keccak256, toUtf8Bytes } = require("ethers");
const { hashVote } = require("../utils/hash");
const { votes } = require("../storage/votes");
const { prisma } = require("../config/db");
const SubmitVoteDTO = require("../utils/dto/vote.submit.dto");
const sendUserVoteConfirmation = require("../services/notification.service");
const { getVoteProof } = require("../services/merkle");
const { formatIdForBlockchain } = require("../utils/formatId");
const { startVotingOnChain } = require("../services/blockchain.service");


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
        const { consultId } = req.body;
        if (!consultId) {
            return res.status(400).json({
                error: "consultId requis"
            });
        }
        // récupérer votes DB
        const consultationVotes = await prisma.vote.findMany({
            where: {
                consultationId: consultId
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        if (consultationVotes.length === 0) {
            return res.status(400).json({
                error: "Aucun vote trouvé"
            });
        }

        // génération arbre
        const { root } =
            generateConsultationTree(consultationVotes);

        // format blockchain
        const consultIdBytes32 =
            formatIdForBlockchain(consultId);

        // envoi blockchain
        const result = await submitMerkleRoot(
            root,
            consultIdBytes32
        );

        return res.status(200).json({
            success: true,
            merkleRoot: root,
            totalVotes: consultationVotes.length,
            txHash: result.txHash,
            blockNumber: result.blockNumber
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
}


const generateProofController = async (req, res) => {
    try {
        const { consultId, userId } = req.body;
        if (!consultId || !userId) {
            return res.status(400).json({
                error: "Champs manquants"
            });
        }

        const allVotes = await prisma.vote.findMany({
            where: {
                consultationId: consultId
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        const vote = allVotes.find(
            v => v.userId === userId
        );

        if (!vote) {
            return res.status(404).json({
                error: "Vote introuvable"
            });
        }

        const proofData = getVoteProof(
            allVotes,
            vote.hashVote
        );

        return res.status(200).json({
            success: true,
            voteHash: vote.hashVote,
            proof: proofData.proof
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });
    }
}


const getUserProofController = async (req, res) => {
    try {
        const { consultationId } = req.params;
        const userId = req.user.id;

        const option = await prisma.voteOption.findFirst({
            where: {
                id: dto.optionId,
                consultationId: dto.consultationId
            }
        });

        if (!option) {
            return res.status(400).json({
                error: "Option invalide pour cette consultation"
            });
        }

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

const checkUserVote = async (req, res) => {
    try {
        const userId = req.user.id;
        const { consultId } = req.params;

        const vote = await prisma.vote.findFirst({
            where: {
                userId,
                consultationId: consultId,
            },
        });

        return res.json({
            hasVoted: !!vote,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erreur interne",
        });
    }
};


const startVotingController = async (req, res) => {

    try {
        const { consultId } = req.params;
        // VALIDATION
        if (!consultId) {
            return res.status(400).json({
                success: false,
                error: "consultId requis"
            });
        }
        // CHECK CONSULTATION
        const consultation =
            await prisma.consultation.findUnique({
                where: {
                    id: consultId
                }
            });

        if (!consultation) {
            return res.status(404).json({
                success: false,
                error: "Consultation introuvable"
            });
        }
        // CHECK STATUS
        if (consultation.status !== "OUVERTE") {
            return res.status(400).json({
                success: false,
                error: "Consultation déjà démarrée ou fermée"
            });
        }
        // START ON BLOCKCHAIN
        const blockchainResult =
            await startVotingOnChain(
                consultId
            );
        // UPDATE DATABASE
        const updatedConsultation =
            await prisma.consultation.update({
                where: {
                    id: consultId
                },
                data: {
                    status: "OUVERTE"
                }
            });

        // RESPONSE

        return res.status(200).json({
            success: true,
            message:
                "Vote démarré avec succès",

            consultation:
                updatedConsultation,

            blockchain: {
                txHash:
                    blockchainResult.txHash,

                blockNumber:
                    blockchainResult.blockNumber
            }
        });

    } catch (error) {

        console.error(
            "Erreur start voting controller:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Erreur lors du démarrage du vote"
        });
    }
};

module.exports = {
    submitVote, submitMerkleRootController, generateProofController, getUserProofController, checkUserVote, startVotingController
}
