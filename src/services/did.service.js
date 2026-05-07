import { create } from 'domain';
import { json } from 'express';
import { get } from 'http';

const ethers = require('ethers');
const crypto = require('crypto');
const { prisma } = require('../config/prisma');

export class DIDService {


    // generer un DID pour un utilisateur
    static async generateDID(userId) {
        // generer une clé privée
        const wallet = ethers.Wallet.createRandom();
        const didMethod = "did:ethr";
        const did = `${didMethod}:${wallet.address}`;

        // Construction du DID Document (W3C standard)
        const didDocument = {
            "@context": "https://www.w3.org/ns/did/v1",
            id: didId,
            verificationMethod: [{
                id: `${did}#keys-1`,
                type: "EcdsaSecp256k1RecoveryMethod2020",
                controller: didId,
                blockchainAccountId: `eip155:137:${wallet.address}` // Polygon Mainnet
            }],
            authentication: [`${didId}#keys-1`],
            assertionMethod: [`${didId}#keys-1`],
        };

        let blockchainTxHash = null;
        let isAnchored = false;

        // ancrer le DID sur la blockchain
        try {
            const contract = getIdetityRegistryContract();
            const tx = await contract.registerDID(
                wallet.address,
                JSON.stringify(didDocument)
            );
            const receipt = await tx.wait();
            blockchainTxHash = receipt.transactionHash;
            isAnchored = true;

            console.log(`DID ancré on-chain::::::::: ${blockchainTxHash}`);

        } catch (error) {
            console.error("Erreur lors de l'ancrage du DID sur la blockchain:", error);
        }

        const didRecord = await prisma.dID.create({
            data: {
                id: didId,
                userId: userId,
                document: json.stringify(didDocument),
                methode: didMethod,
                PublicKeyCredential: wallet.address,
                blockchainTxHash: blockchainTxHash,
                isAnchored: isAnchored
            }
        });

        return didRecord;
    }

    // Resoudre un did pour recuperer son document
    static async resolveDID(didId) {

        const didRecord = await prisma.dID.findFirst({
            where: {
                document: { contains: didId },
                include: { user: { selected: { id: true, email: true } } }

            }
        });

        if (didRecord) {
            return {
                didDocument: JSON.parse(didRecord.document),
                metadata: {
                    isAnchored: didRecord.isAnchored,
                    txhash: didRecord.blockchainTxHash,
                    createdAt: didRecord.createdAt,
                }
            }
        }

        // Résolution on-chain en fallback
        try {
            const contract = getIdetityRegistryContract();
            const adress = didId.split(':').pop();
            const documentOnChain = await contract.getDIDDocument(adress);
            return {
                didDocument: JSON.parse(documentOnChain),
                metadata: {
                    isAnchored: true,
                    txhash: null,
                    createdAt: null,
                }
            }
        } catch (error) {
            console.error("Erreur lors de la résolution du DID on-chain:", error);
            throw new Error("DID not found");
        }
    }

    // ── Hash un credential pour l'ancrage sur la blockchain
    static hashCredential(payload) {
        return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    }

}