const { keccak256 } = require("ethers");
const {MerkleTree} = require("merkletreejs");

const generateConsultationTree = (votes) => {
    // On transforme les hashVote de la DB en buffers pour MerkleTree.js
    const leaves = votes.map(v => Buffer.from(v.hashVote.slice(2), 'hex'));

    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    return { tree, root };
}

/**
 * Génère une preuve de Merkle pour un vote spécifique.
 * @param {Object} tree - L'instance MerkleTree générée
 * @param {string} hash - Le hash du vote stocké en DB (hashVote)
 */
const getMerkleProof = (tree, hash) => {
    // On retire le '0x' si présent et on transforme en Buffer
    const leaf = Buffer.from(hash.startsWith('0x') ? hash.slice(2) : hash, 'hex');
    return tree.getHexProof(leaf);
};

/**
 * Génère la preuve de Merkle pour un vote spécifique au sein d'une consultation
 * @param {Array} allVotes - Liste de tous les votes de la consultation (depuis la DB)
 * @param {string} userVoteHash - Le hashVote du votant dont on veut la preuve
 */
const getVoteProof = (allVotes, userVoteHash) => {
    // Reconstruction de l'arbre avec tous les votes
    const leaves = allVotes.map(v => Buffer.from(v.hashVote.slice(2), 'hex'));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

    // Préparation de la feuille (le vote de l'utilisateur)
    const leaf = Buffer.from(userVoteHash.slice(2), 'hex');

    // Génération de la preuve (tableau de hashes frères)
    const proof = tree.getHexProof(leaf);

    return {
        proof,
        root: tree.getHexRoot(),
        leaf: userVoteHash
    };
};

module.exports = {
    generateConsultationTree, getMerkleProof,getVoteProof
}