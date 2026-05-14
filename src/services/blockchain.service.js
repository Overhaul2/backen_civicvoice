
const { ethers } = require("ethers");
const { generateConsultationTree } = require("./merkle");
const { formatIdForBlockchain } = require("../utils/formatId");

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);

const ABI = [
    "function submitMerkleRoot(bytes32 root, bytes32 consultId) external",
    "function addEngagement(bytes32 engId, bytes32 contentHash, string calldata metadataURI) external"
];

const contract = new ethers.Contract(process.env.BLOCKCHAIN_CONTRACT_ADDRESS, ABI, wallet);

/**
 * Soumet la racine de Merkle à la blockchain.
 * @param {string} root - La racine au format hex (0x...)
 * @param {string} consultId - L'ID de la consultation converti en bytes32
 */
const submitMerkleRoot = async (root, consultId) => {
    try {
        // Optionnel : Estimation dynamique du gaz pour éviter les échecs sur Amoy
        const feeData = await provider.getFeeData();

        const tx = await contract.submitMerkleRoot(root, consultId, {
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            maxFeePerGas: feeData.maxFeePerGas,
        });

        const receipt = await tx.wait();
        return receipt.hash;
    } catch (error) {
        console.error("Erreur lors de la soumission Merkle Root:", error);
        throw new Error("Échec de la transaction blockchain");
    }
};

const anchorEngagementOnChain = async (engId, contentHash, metadataURI) => {
    try {
        const tx = await contract.addEngagement(engId, contentHash, metadataURI);
        const receipt = await tx.wait();
        return { txHash: receipt.hash };
    } catch (error) {
        console.error("Erreur lors de l'ancrage de l'engagement:", error);
        throw error;
    }
};


const performAnchoring = async (consultationId) => {

    try {

        const balance = await provider.getBalance(wallet.address);
        const minBalance = ethers.parseEther("0.1"); // Seuil de sécurité pour éviter les échecs de transaction

        if (balance < minBalance) {
            await sendAdminAlert(
                "Solde MATIC Faible",
                `Le portefeuille d'ancrage n'a que ${ethers.formatEther(balance)} MATIC. Risque d'échec des prochaines transactions.`
            );
        }
        // Récupération des votes triés par date de création pour garantir un ordre stable dans l'arbre de Merkle
        const votes = await prisma.vote.findMany({
            where: { consultationId },
            orderBy: { createdAt: 'asc' }
        });

        if (votes.length === 0) throw new Error("Aucun vote trouvé pour l'ancrage");

        // Préparation cryptographique
        const { root } = generateConsultationTree(votes);
        const consultIdBytes32 = formatIdForBlockchain(consultationId);

        // Envoi sur Polygon Amoy
        const txHash = await submitMerkleRoot(root, consultIdBytes32);

        // Attente de la confirmation (pour avoir le blockNumber)
        const receipt = await provider.waitForTransaction(txHash);

        // Mise à jour atomique de la DB
        return await prisma.$transaction(async (tx) => {
            // Enregistrer la racine
            const merkleRecord = await tx.merkleRoot.create({
                data: {
                    consultationId,
                    rootHash: root,
                    txHash: txHash
                }
            });

            // Mettre à jour le statut de la consultation
            await tx.consultation.update({
                where: { id: consultationId },
                data: { status: "FERMEE" }
            });

            // Mettre à jour tous les votes avec les preuves blockchain
            await tx.vote.updateMany({
                where: { consultationId },
                data: {
                    txHash: txHash,
                    blockNumber: receipt.blockNumber
                }
            });
            return merkleRecord;
        });

    } catch (error) {
        // Gestion spécifique des erreurs courantes
        let errorType = "Erreur d'ancrage critique";
        if (error.code === 'INSUFFICIENT_FUNDS') {
            errorType = "Fonds insuffisants (MATIC)";
        } else if (error.code === 'NONCE_EXPIRED') {
            errorType = "Erreur de synchronisation Nonce";
        } else if (error.code === 'TIMEOUT') {
            errorType = "Délai d'attente blockchain dépassé";
        }
        // // Alerte Admin
        // await sendAdminAlert(errorType, `Consultation: ${consultationId}\nMessage: ${error.message}`);
        throw error;
    }
};

module.exports = { submitMerkleRoot, anchorEngagementOnChain, performAnchoring };