const { toUtf8Bytes, keccak256 } = require("ethers");
// import keccak256 from "keccak256";


function hashVote(userId, optionId, consultationId) {
    return keccak256(
        toUtf8Bytes(`${userId}-${optionId}-${consultationId}`)
    )
}

const generateEngagementHash = (
    title,
    description,
    consultationId
) => {

    return keccak256(
        toUtf8Bytes(
            `${title}-${description}-${consultationId}`
        )
    );
};

module.exports = {
    hashVote,generateEngagementHash
}