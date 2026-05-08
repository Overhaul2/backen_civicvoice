const { ethers } = require("ethers");

const provider= new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);

const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);

const ABI = [
    "function submitMerkleRoot(bytes32,bytes32)"
]

const contract = new ethers.Contract(process.env.BLOCKCHAIN_CONTRACT_ADDRESS,ABI,wallet);

export async function submitMerkleRoot(root,consultId){
    const tx = await contract.submitMerkleRoot(root,consultId);
    await tx.wait();    
    return tx.hash;
}