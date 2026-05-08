import { keccak256 } from "ethers";
import MerkleTree from "merkletreejs";

export function buldMerkleTree(votes) {
    const leaves = votes.map(v => Buffer.from(v.voteHash.slice(2), 'hex'));

    const tree = new MerkleTree(leaves,keccak256,{sortPairs:true});
    return {
        tree,
        root:"0x"+tree.getRoot().toString('hex')
    };
}

export function getMerkleProof(tree,hash){
    const leaf = Buffer.from(hash.slice(2), 'hex');
    return tree.getHexProof(leaf);
} 