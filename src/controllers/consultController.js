const { prisma } = require("../config/db");
const { performAnchoring } = require("../services/blockchain.service");
const CreateConsultationDTO = require("../utils/dto/create-consultation.dto");
const ConsultationResponseDTO = require("../utils/dto/response.consultation.dO");
const UpdateConsultationDTO = require("../utils/dto/update-consultation.dto ");


const create = async (req, res) => {
    try {
        const dto = new CreateConsultationDTO(req.body);
        dto.validate();

        // Création consultation + options
        const consultation =
            await prisma.consultation.create({
                data: {
                    title: dto.title,
                    imageUrl: dto.imageUrl,
                    description: dto.description,
                    status: dto.status,
                    startAt: new Date(dto.startAt),
                    endAt: new Date(dto.endAt),

                    creatorId: req.user.id,

                    options: {
                        create: dto.options.map((option) => ({
                            label: option.label,
                        })),
                    },
                },

                include: {
                    options: true,
                },
            });

        return res.status(200).json({ consultation })
    } catch (error) {
        console.error("::::::::::::", error);
        return res.status(400).json({
            message: error.message || "Erreur interne",
        });
    }
}


const update = async (req, res) => {
    try {
        const consultationId = req.params.id;

        const dto = new UpdateConsultationDTO(req.body);
        dto.validate();

        // Vérifier si la consultation existe
        const consultationExists = await prisma.consultation.findUnique({
            where: { id: consultationId },
        });

        if (!consultationExists) {
            return res.status(404).json({
                message: "Consultation introuvable",
            });
        }

        // Vérifier si des votes existent
        const votesCount = await prisma.vote.count({
            where: {
                consultationId: consultationId,
            },
        });

        if (votesCount > 0) {
            return res.status(400).json({
                message: "Impossible de modifier une consultation déjà votée",
            });
        }

        // Bloquer certaines modifications
        if (
            votesCount > 0 &&
            (
                dto.options !== undefined ||
                dto.startAt !== undefined
            )
        ) {
            return res.status(400).json({
                message:
                    "Impossible de modifier les options ou la date de début après des votes",
            });
        }

        // Préparer data update
        const updateData = {
            ...(dto.title && {
                title: dto.title,
            }),

            ...(dto.description && {
                description: dto.description,
            }),

            ...(dto.imageUrl !== undefined && {
                imageUrl: dto.imageUrl,
            }),

            ...(dto.status && {
                status: dto.status,
            }),

            ...(dto.startAt && {
                startAt: new Date(dto.startAt),
            }),

            ...(dto.endAt && {
                endAt: new Date(dto.endAt),
            }),
        };

        // Gestion update options
        if (
            dto.options &&
            votesCount === 0
        ) {
            // supprimer anciennes options
            await prisma.option.deleteMany({
                where: {
                    consultationId: consultationId,
                },
            });

            // recréer nouvelles options
            updateData.options = {
                create: dto.options.map(
                    (option) => ({
                        label: option.label,
                    })
                ),
            };
        }

        // Update consultation
        const consultation =
            await prisma.consultation.update({
                where: {
                    id: consultationId,
                },

                data: updateData,

                include: {
                    options: true,
                },
            });

        return res.status(200).json({
            message:
                "Consultation mise à jour avec succès",
            consultation,
        });

    } catch (error) {
        console.error(":::::::::::", error);
        return res.status(400).json({
            message: error.message || "Erreur interne",
        });
    }
};

const remove = async (req, res) => {
    try {
        const consultationId = req.params.id;

        // Vérifier si la consultation existe
        const consultation = await prisma.consultation.findUnique({
            where: { id: consultationId },
            include: {
                votes: true, // relation votes
            },
        });

        if (!consultation) {
            return res.status(404).json({
                message: "Consultation introuvable",
            });
        }

        // Vérifier si des votes sont liés
        if (consultation.votes.length > 0) {
            return res.status(400).json({
                message:
                    "Impossible de supprimer cette consultation car des votes y sont associés",
            });
        }

        // Suppression
        await prisma.consultation.delete({
            where: { id: consultationId },
        });

        return res.json({
            message: "Consultation supprimée",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Erreur interne",
        });
    }
};

const getAll = async (req, res) => {
    try {

        const consultations = await prisma.consultation.findMany({
            include: {

                creator: {
                    select: {
                        id: true,
                        email: true,
                    },
                },

                options: {
                    include: {
                        _count: {
                            select: {
                                votes: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        // Transformation propre DTO
        const formatted = consultations.map((consultation) => ({

            id: consultation.id,

            title: consultation.title,

            imageUrl: consultation.imageUrl,

            description: consultation.description,

            status: consultation.status,

            startAt: consultation.startAt,

            endAt: consultation.endAt,

            createdAt: consultation.createdAt,

            creator: consultation.creator,

            options: consultation.options.map((option) => ({

                id: option.id,

                label: option.label,

                consultationId: option.consultationId,

                // Vote count calculé automatiquement
                voteCount: option._count.votes,

            })),
        }));

        return res.status(200).json(formatted);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erreur Interne",
        });
    }
};


// const getAll = async (req, res) => {
//     try {
//         const consultations = await prisma.consultation.findMany({
//             include: {
//                 options: true,
//                 creator: true,
//             },
//             orderBy: {
//                 createdAt: "desc",
//             },
//         });
//         return res.json(consultations.map(ConsultationResponseDTO));
//     } catch (error) {
//         return res.status(500).json({ message: "Erreur Interne" });
//     }
// }

const getOne = async (req, res) => {
    try {
        const consultation = await prisma.consultation.findUnique({
            where: { id: req.params.id },
            include: {
                options: true,
                votes: true,
            },
        });

        if (!consultation) {
            return res.status(404).json({ message: "Consultation Introuvable" });
        }

        return res.json(consultation);
    } catch (error) {
        return res.status(500).json({ message: "Erreur Interne" });
    }
}

const closeConsultationController = async (req, res) => {
    try {
        const { consultationId } = req.body;

        if (!consultationId) {
            return res.status(400).json({ error: "ID de consultation requis" });
        }
        // On délègue toute la logique complexe au service
        const result = await performAnchoring(consultationId);

        res.json({
            success: true,
            message: "Consultation fermée et ancrée avec succès",
            txHash: result.txHash,
            blockNumber: result.blockNumber,
            votesAnchored: result.votesCount,
            rootHash: result.rootHash
        });
    } catch (error) {
        console.error("Erreur Ancrage:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    create,
    update,
    remove,
    getAll,
    getOne,
    closeConsultationController,
}