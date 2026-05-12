const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);

const ABI = [
    "function submitMerkleRoot(bytes32,bytes32)","function addEngagement(bytes32 engId, bytes32 contentHash, string calldata metadataURI) external"
]

const contract = new ethers.Contract(process.env.BLOCKCHAIN_CONTRACT_ADDRESS, ABI, wallet);

const submitMerkleRoot = async (root, consultId) => {
    const tx = await contract.submitMerkleRoot(root, consultId);
    await tx.wait();
    return tx.hash;
}


const anchorEngagementOnChain = async (
    engId,
    contentHash,
    metadataURI
) => {

    const tx = await contract.addEngagement(
        engId,
        contentHash,
        metadataURI
    );

    const receipt = await tx.wait();

    return {
        txHash: receipt.hash
    };
};

module.exports = {
    submitMerkleRoot,anchorEngagementOnChain
}
