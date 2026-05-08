const { toUtf8Bytes,keccak256 } = require("ethers");
// import keccak256 from "keccak256";


function hashVote(userId,optionId,consultationId){
    return keccak256(
        toUtf8Bytes(`${userId}-${optionId}-${consultationId}`)
    )
}

module.exports={
    hashVote
}