const { ethers } = require("ethers");

const formatIdForBlockchain = (id) => {
    if (!id) throw new Error("ID requis");

    return ethers.keccak256(
        ethers.toUtf8Bytes(id)
    );
};

module.exports = { formatIdForBlockchain };