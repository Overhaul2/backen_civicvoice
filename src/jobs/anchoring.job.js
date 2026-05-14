
const { prisma } = require("../config/db");
const { submitMerkleRoot } = require("../services/blockchain.service");
const { generateConsultationTree } = require("../services/merkle");

const anchorClosedConsultations = async () => {
    // Utiliser une transaction avec un verrouillage ou un statut intermédiaire
    // pour éviter que deux instances du script n'essaient d'ancrer la même consultation.
    const pendingConsultations = await prisma.consultation.findMany({
        where: {
            status: "OUVERTE",
            endAt: { lte: new Date() },
            // On vérifie qu'un ancrage n'est pas déjà enregistré
            merkleRoot: { is: null }
        },
        include: {
            votes: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (pendingConsultations.length === 0) return;

    for (const consult of pendingConsultations) {
        try {
            // Sécurité : Ne pas traiter si aucun vote, mais marquer comme terminée quand même
            if (consult.votes.length === 0) {
                await prisma.consultation.update({
                    where: { id: consult.id },
                    data: { status: "TERMINEE_SANS_VOTE" }
                });
                continue;
            }

            // Calculer la racine de Merkle
            // On s'assure que les données sont nettoyées avant le hashage
            const { root } = generateConsultationTree(consult.votes);
            const consultIdBytes32 = formatIdForBlockchain(consult.id);

            //  Appel Blockchain avec gestion de timeout/retry
            // On ne met à jour la DB que si la transaction est confirmée
            const txHash = await submitMerkleRoot(root, consultIdBytes32);

            // Bloc Atomique : On enregistre la preuve et on ferme la consultation
            await prisma.$transaction(async (tx) => {
                // Création de l'entrée MerkleRoot
                await tx.merkleRoot.create({
                    data: {
                        consultationId: consult.id,
                        rootHash: root,
                        txHash: txHash
                    }
                });

                // Changement de statut final
                await tx.consultation.update({
                    where: { id: consult.id },
                    data: { status: "FERMEE" }
                });
            });

            console.log(`[SUCCESS] Consultation ${consult.id} ancrée. TX: ${txHash}`);

        } catch (error) {
            // Gestion des erreurs spécifique (ex: erreur de gaz, nonce, etc.)
            console.error(`::::::::::: [ERROR] Échec de l'ancrage pour ${consult.id}:`, error.message);

            // On peut ajouter ici un système de notification (ex: Slack/Email) pour l'admin
        }
    }
};