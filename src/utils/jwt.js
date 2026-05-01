
const jwt = require("jsonwebtoken");

const generatedToken = (user)=>{
    return jwt.sign({
        id: user.id, email: user.email,
    },
process.env.JWT_SECRET,
)
}
module.exports = {generatedToken};