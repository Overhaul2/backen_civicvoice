
const { keccak256, toUtf8Bytes } = require("ethers");

/**
 * Convertit un identifiant (UUID) en bytes32 pour la blockchain
 */
const formatIdForBlockchain = (id) => {
    if (!id) return null;
    // On hash l'UUID pour garantir un format bytes32 fixe
    return keccak256(toUtf8Bytes(id));
};

module.exports = { formatIdForBlockchain };