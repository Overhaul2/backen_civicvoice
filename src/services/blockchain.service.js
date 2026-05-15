const { prisma } = require("../config/db");
const { ethers } = require("ethers");
const { generateConsultationTree } = require("./merkle");
const { formatIdForBlockchain } = require("../utils/formatId");

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);

const ABI = [

    "function createConsultation(bytes32 consultId,uint256 startAt,uint256 endAt,string calldata metadataURI) external",

    "function submitMerkleRoot(bytes32 consultId, bytes32 merkleRoot) external",

    "function addEngagement(bytes32 engId, bytes32 contentHash, string calldata metadataURI) external",

    "function startVoting(bytes32 consultId) external",

    "function consultations(bytes32 consultId) view returns (bool exists, uint256 startAt, uint256 endAt, uint8 status, bytes32 merkleRoot)"
];
const contract = new ethers.Contract(process.env.BLOCKCHAIN_CONTRACT_ADDRESS, ABI, wallet);

// CHECK BLOCKCHAIN CONNECTION
const checkBlockchainConnection = async () => {
    try {
        const network = await provider.getNetwork();

        console.log(":::::: Blockchain connectée");
        console.log("Chain ID:", network.chainId.toString());

        return true;
    } catch (error) {
        console.error(":::: Erreur connexion blockchain:", error.message);
        return false;
    }
};

// CHECK WALLET BALANCE
const checkWalletBalance = async () => {
    try {
        const balance = await provider.getBalance(wallet.address);

        console.log(
            "::::::: Wallet Balance:",
            ethers.formatEther(balance),
            "MATIC"
        );

        return balance;
    } catch (error) {
        console.error(":::: Erreur balance:", error.message);
        throw error;
    }
};


/**
 * Soumet la racine de Merkle à la blockchain.
 * @param {string} root - La racine au format hex (0x...)
 * @param {string} consultId - L'ID de la consultation converti en bytes32
 */
// const submitMerkleRoot = async (root, consultId) => {
//     try {
//         // Optionnel : Estimation dynamique du gaz pour éviter les échecs sur Amoy
//         const feeData = await provider.getFeeData();

//         const tx = await contract.submitMerkleRoot(root, consultId, {
//             maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
//             maxFeePerGas: feeData.maxFeePerGas,
//         });

//         const receipt = await tx.wait();
//         return receipt.hash;
//     } catch (error) {
//         console.error("Erreur lors de la soumission Merkle Root:", error);
//         throw new Error("Échec de la transaction blockchain");
//     }
// };


const createConsultationOnChain = async ({
    consultId,
    startAt,
    endAt,
    metadataURI
}) => {

    try {

        const consultIdBytes32 =
            formatIdForBlockchain(consultId);

        const tx =
            await contract.createConsultation(
                consultIdBytes32,
                startAt,
                endAt,
                metadataURI
            );

        const receipt = await tx.wait();

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
        };

    } catch (error) {

        console.error(
            "Erreur création consultation blockchain:",
            error
        );

        throw error;
    }
};

const startVotingOnChain = async (consultId) => {

    try {

        const consultIdBytes32 =
            formatIdForBlockchain(consultId);
        console.log("CONSULT ID RAW:", consultId);
        console.log("CONSULT ID BYTES32:", consultIdBytes32);

        const onChain = await contract.consultations(consultIdBytes32);

        if (!onChain.exists) {
            throw new Error("::::::::::Consultation inexistante sur blockchain");
        }

        if (onChain.status !== 0n) {
            throw new Error(":::::::Status blockchain invalide");
        }

        const tx =
            await contract.startVoting(
                consultIdBytes32
            );

        const receipt = await tx.wait();

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
        };

    } catch (error) {

        console.error(
            "::::::::::Erreur start voting blockchain:",
            error
        );

        throw error;
    }
};


// SUBMIT MERKLE ROOT
const submitMerkleRoot = async (root, consultId) => {
    try {
        console.log("=================================");
        console.log(":::::::::: ENVOI BLOCKCHAIN ::::::::::");
        console.log("=================================");
        console.log("Root:", root);
        console.log("Consultation ID:", consultId);
        console.log("Wallet:", wallet.address);

        // Vérifier connexion
        await checkBlockchainConnection();

        // Vérifier balance
        const balance = await checkWalletBalance();

        const minBalance = ethers.parseEther("0.01");

        if (balance < minBalance) {
            throw new Error(
                "Solde insuffisant pour effectuer la transaction"
            );
        }

        // Récupération dynamique des frais
        const feeData = await provider.getFeeData();

        console.log(":::::::::: ⛽ Gas Fees:");
        console.log(
            "maxFeePerGas:",
            feeData.maxFeePerGas?.toString()
        );
        console.log(
            "maxPriorityFeePerGas:",
            feeData.maxPriorityFeePerGas?.toString()
        );

        // Estimation du gas
        const gasEstimate =
            await contract.submitMerkleRoot.estimateGas(
                consultId, root
            );

        console.log(
            ":::::::::: ⛽ Gas Estimate:",
            gasEstimate.toString()
        );

        // Transaction
        const tx = await contract.submitMerkleRoot(
            root,
            consultId,
            {
                gasLimit: gasEstimate + BigInt(50000),
                maxPriorityFeePerGas:
                    feeData.maxPriorityFeePerGas,
                maxFeePerGas: feeData.maxFeePerGas,
            }
        );

        console.log(":::::::::: Transaction envoyée");
        console.log(":::::::::: TX HASH:", tx.hash);

        // Attente confirmation
        const receipt = await tx.wait();

        console.log(":::::::::: Transaction confirmée");
        console.log(":::::::::: Block Number:", receipt.blockNumber);

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
        };
    } catch (error) {
        console.error(" Erreur submitMerkleRoot:");

        if (error.shortMessage) {
            console.error("::::::::::::::::::::", error.shortMessage);
        }

        console.error(error);

        throw new Error(
            error.shortMessage ||
            error.message ||
            "Erreur blockchain"
        );
    }
};


// ANCHOR ENGAGEMENT
const anchorEngagementOnChain = async (
    engId,
    contentHash,
    metadataURI
) => {
    try {
        const tx = await contract.addEngagement(
            engId,
            contentHash,
            metadataURI
        );

        console.log(":::::::::: Engagement TX:", tx.hash);

        const receipt = await tx.wait();

        console.log(":::::::::: Engagement ancré");

        return {
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
        };
    } catch (error) {
        console.error(
            "::::::::::: Erreur ancrage engagement:",
            error
        );

        throw error;
    }
};


//COMPLETE ANCHORING PROCESS
const performAnchoring = async (consultId) => {

    try {

        console.log("=================================");
        console.log("::::::: DÉBUT ANCRAGE :::::::::");
        console.log("=================================");

        // CHECK CONSULTATION
        const consultation =
            await prisma.consultation.findUnique({
                where: {
                    id: consultId,
                },
            });

        if (!consultation) {
            throw new Error("Consultation introuvable");
        }

        if (consultation.status === "FERMEE") {
            throw new Error(
                "Cette consultation est déjà fermée"
            );
        }

        // GET VOTES
        const votes = await prisma.vote.findMany({
            where: {
                consultationId: consultId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        if (votes.length === 0) {
            throw new Error(
                "Aucun vote trouvé pour cette consultation"
            );
        }

        console.log(":::::::: Votes trouvés:", votes.length);

        // GENERATE MERKLE TREE
        const { root } =
            generateConsultationTree(votes);

        console.log(":::::: Merkle Root:", root);

        // FORMAT ID
        const consultIdBytes32 =
            formatIdForBlockchain(consultId);

        console.log(
            "::::::::::: Consultation Bytes32:",
            consultIdBytes32
        );

        // SEND TO BLOCKCHAIN
        const blockchainResult =
            await submitMerkleRoot(
                root,
                consultIdBytes32
            );

        // SAVE DATABASE
        const result = await prisma.$transaction(
            async (tx) => {

                // Sauvegarde Merkle Root
                const merkleRecord =
                    await tx.merkleRoot.create({
                        data: {
                            consultationId: consultId,
                            rootHash: root,
                            txHash:
                                blockchainResult.txHash,
                        },
                    });

                // Fermer consultation
                await tx.consultation.update({
                    where: {
                        id: consultId,
                    },
                    data: {
                        status: "FERMEE",
                    },
                });

                // Mettre à jour votes
                await tx.vote.updateMany({
                    where: {
                        consultationId: consultId,
                    },
                    data: {
                        txHash:
                            blockchainResult.txHash,

                        blockNumber:
                            blockchainResult.blockNumber,
                    },
                });

                return merkleRecord;
            }
        );

        console.log("::::::: Ancrage terminé :::::::::");

        return {
            success: true,
            txHash: blockchainResult.txHash,
            blockNumber:
                blockchainResult.blockNumber,
            votesCount: votes.length,
            rootHash: root,
            merkleRecord: result,
        };

    } catch (error) {

        console.error(
            "::::::: Erreur performAnchoring ::::::::"
        );

        console.error(error);

        if (error.code === "INSUFFICIENT_FUNDS") {

            throw new Error(
                "Fonds insuffisants sur le wallet blockchain"
            );
        }

        if (error.code === "NONCE_EXPIRED") {

            throw new Error(
                "Erreur nonce blockchain"
            );
        }

        if (error.code === "NETWORK_ERROR") {

            throw new Error(
                "Erreur réseau blockchain"
            );
        }

        throw new Error(
            error.message || "Erreur d'ancrage"
        );
    }
};

module.exports = {
    submitMerkleRoot,
    anchorEngagementOnChain,
    performAnchoring,
    checkBlockchainConnection,
    checkWalletBalance,
    createConsultationOnChain,
    startVotingOnChain
};