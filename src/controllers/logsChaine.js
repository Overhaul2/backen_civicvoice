const { prisma } = require("../config/db");


const createBlockchainLog = async ({ entityId, entityType, network, status, hash = "", txHash = null, blockNumber = null, explorerUrl = null }) => {
    try {
        return await prisma.blockchainLog.create({
            data: {
                entityType,
                entityId,
                hash, // Hash interne ou empreinte des données si nécessaire
                txHash,
                blockNumber,
                network,
                status,
                explorerUrl
            }
        });
    } catch (logError) {
        // On ne veut pas bloquer l'application si l'écriture du log échoue
        console.error("Impossible d'enregistrer le BlockchainLog:", logError);
    }
};

module.exports = {
    createBlockchainLog
}