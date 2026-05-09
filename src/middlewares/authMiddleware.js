const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken")


const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                error: "Token manquant"
            });
        }

        const token =
            authHeader.split(" ")[1];

        const decoded =
            jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SEKRET
            );

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Token invalide"
        });

    }


    // ROLE MIDDLEWARE

    const authorize =
        (...roles) =>
            (req, res, next) => {

                if (!roles.includes(req.user.role)) {

                    return res.status(403).json({
                        error: "Accès refusé"
                    });
                }
                next();
            };
}

module.exports = {
    authenticate
}