
const jwt = require("jsonwebtoken")


// ACCESS TOKEN
async function generateAccessToken(user) {
    return await jwt.sign({
        id: user.id,
        role: user.role,
        email: user.email,
    },
        process.env.ACCESS_TOKEN_SEKRET,
        {
            expiresIn:
                process.env.EXPIRE_TOKEN_ACCES_EXPIRE
        }
    );
}

// REFRESH TOCKEN

async function generateRefreshToken(user) {
    return jwt.sign({
        id: user.id,
    },
        process.env.REFRESH_TOKEN_SEKRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_ACCES_EXPIRE
        }
    );
}


// VERIFICATION ACCESS TOKEN

function verifyAccessToken(token){
    return jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SEKRET
    );
}

module.exports = {
    generateAccessToken,generateRefreshToken,verifyAccessToken
}