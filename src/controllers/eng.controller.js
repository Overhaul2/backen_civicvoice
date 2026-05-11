const { keccak256, toUtf8Bytes } = require("ethers");
const { prisma } = require("../config/db");
const { generateEngagementHash } = require("../utils/hash");
const { anchorEngagementOnChain } = require("../services/blockchain.service");

const createEngagement = async (req, res) => {
    try {
        const {
            title,
            description,
            consultationId,
            metadataURI
        } = req.body;

        const creatorId = req.user.id;

        const consultation = await prisma.consultation.findUnique({
            where: { id: consultationId },
        });

        if (!consultation) {
            return res.status(404).json({
                error: "Consultation introuvable"
            });
        }

        const hashEngagement = generateEngagementHash(
            title,
            description,
            consultationId,
        );

        // engagement ID blockchain
        const engagementBytes32 = keccak256(
            toUtf8Bytes(`${consultationId}-${Date.now()}`)
        );

        // blockchain
        const blockchainResult = await anchorEngagementOnChain(
            engagementBytes32,
            hashEngagement,
            metadataURI || "",
        );

        // save db
        const engagement =
            await prisma.engagement.create({
                data: {
                    title,
                    description,
                    consultationId,
                    creatorId,
                    metadataURI,
                    hashEngagement,
                    txHash:
                        blockchainResult.txHash
                }
            });

        return res.status(201).json({
            success: true,
            message:
                "Engagement enregistré on-chain",
            engagement
        });

    } catch (error) {
        console.error("Error creating engagement:", error);
        return res.status(500).json({
            error: "Erreur interne du serveur"
        });
    }
}


const getAllEngagements = async (
    req,
    res
) => {

    try {

        const engagements =
            await prisma.engagement.findMany({
                include: {
                    consultation: true,
                    author: {
                        select: {
                            id: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

        return res.status(200).json({
            engagements
        });

    } catch (error) {

        return res.status(500).json({
            error:
                "Erreur récupération"
        });
    }
};

const getEngagementById = async (
    res
) => {

    try {

        const { id } = req.params;

        const engagement =
            await prisma.engagement.findUnique({
                where: { id },
                include: {
                    consultation: true,
                    author: true
                }
            });

        if (!engagement) {
            return res.status(404).json({
                error:
                    "Engagement introuvable"
            });
        }

        return res.status(200).json({
            engagement
        });

    } catch (error) {

        return res.status(500).json({
            error:
                "Erreur récupération"
        });
    }
};


const updateEngagementStatus = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const { status } = req.body;

        const engagement =
            await prisma.engagement.update({
                where: { id },
                data: {
                    status
                }
            });

        return res.status(200).json({
            message:
                "Statut mis à jour",
            engagement
        });

    } catch (error) {

        return res.status(500).json({
            error:
                "Erreur mise à jour"
        });
    }
};


module.exports = {
    createEngagement,
    getAllEngagements,
    getEngagementById,
    updateEngagementStatus,
    // deleteEngagement
}


