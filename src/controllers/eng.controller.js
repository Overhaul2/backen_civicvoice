const { keccak256, toUtf8Bytes } = require("ethers");
const { prisma } = require("../config/db");
const { generateEngagementHash } = require("../utils/hash");
const { anchorEngagementOnChain } = require("../services/blockchain.service");
const CreateEngagementDTO = require("../utils/dto/create-engagement.dto");
const EngagementMapper = require("../utils/mapper/eng.mapper");
const ApiResponse = require("../utils/dto/api.response");


const createEngagement = async (req, res) => {
    try {
        const dto = new CreateEngagementDTO(req.body);
        const validation = dto.validate();

        if (!validation.valid) {
            return res.status(400).json(
                ApiResponse.error(
                    "Validation failed",
                    validation.errors
                )
            );
        }

        const creatorId = req.user.id;

        const consultation = await prisma.consultation.findUnique({
            where: { id: dto.consultationId },
        });

        if (!consultation) {
            return res.status(404).json({
                error: "Consultation introuvable"
            });
        }

        // 1. check ownership
        if (consultation.creatorId !== creatorId) {
            return res.status(403).json({
                error: "Accès refusé : vous n'êtes pas le créateur de cette consultation"
            });
        }

        // 2. check duplicate engagement
        const existingEngagement = await prisma.engagement.findFirst({
            where: {
                consultationId: dto.consultationId,
                title: dto.title,
                description: dto.description,
            }
        });

        if (existingEngagement) {
            return res.status(409).json({
                error: "Un engagement similaire existe déjà"
            });
        }

        // hash
        const hashEngagement = generateEngagementHash(
            dto.title,
            dto.description,
            dto.consultationId,
        );

        // blockchain id
        const engagementBytes32 = keccak256(
            toUtf8Bytes(`${dto.consultationId}-${Date.now()}`)
        );

        // blockchain
        const blockchainResult = await anchorEngagementOnChain(
            engagementBytes32,
            hashEngagement,
            dto.metadataURI || "",
        );

        // save db
        const engagement = await prisma.engagement.create({
            data: {
                title: dto.title,
                description: dto.description,
                consultationId: dto.consultationId,
                creatorId,
                metadataURI: dto.metadataURI,
                hashEngagement,
                txHash: blockchainResult.txHash
            },
            include: {
                author: true
            }
        });

        const response = EngagementMapper.toDTO(engagement);

        return res.status(201).json(
            ApiResponse.success(
                response,
                "Engagement créé on-chain"
            )
        );

    } catch (error) {
        console.error("Error creating engagement:", error);

        return res.status(500).json({
            error: "Erreur interne du serveur"
        });
    }
};


const getAllEngagements =
    async (req, res) => {

        try {

            const page =
                parseInt(req.query.page) || 1;

            const limit =
                parseInt(req.query.limit) || 10;

            const skip =
                (page - 1) * limit;

            const [data, total] =
                await Promise.all([
                    prisma.engagement.findMany({
                        skip,
                        take: limit,
                        include: {
                            author: true
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    }),

                    prisma.engagement.count()
                ]);

            return res.json(
                ApiResponse.success({
                    items:
                        EngagementMapper.toDTOList(
                            data
                        ),

                    pagination: {
                        page,
                        limit,
                        total,
                        pages:
                            Math.ceil(total / limit)
                    }
                })
            );

        } catch (error) {

            return res.status(500).json(
                ApiResponse.error(
                    "Erreur récupération"
                )
            );
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

const deleteEngagement = async (req, res) => {

}


module.exports = {
    createEngagement,
    getAllEngagements,
    getEngagementById,
    updateEngagementStatus,
    deleteEngagement
}


