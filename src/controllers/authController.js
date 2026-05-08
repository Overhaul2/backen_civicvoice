
const { prisma } = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../services/token.service');
const CreateUserDto = require('../utils/dto/CreateUser.dto');
const LoginDto = require('../utils/dto/login.dto');
const { hashPassword, comparePassword } = require('../utils/password');

const bcrypt = require('bcrypt');

const register = async (req, res) => {
    try {
        const dto = new CreateUserDto(req.body);
        dto.validate;


        const existUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { phoneNumber: dto.phoneNumber },
                ],
            }
        });

        if (existUser) {
            return res.status(400).json({
                error: "Cet utilisater existe déjà"
            })
        }

        const hashedPassword = await hashPassword(dto.password);

        const user = await prisma.user.create({
            data: {
                email: dto.email,
                idCardNumber: dto.idCardNumber,
                phoneNumber: dto.phoneNumber,
                password: hashedPassword
            }
        });


        return res.status(200).json({
            message:
                "Compte créé avec succès",
            user: {
                phoneNumber: user.phoneNumber,
                email: user.email
            }
        });
    } catch (error) {
        console.error(":::::::",error);
        return res.status(500).json({
            error: "Erreur serveur"
        });

    }
}


const login = async (req, res) => {

    const dto = new LoginDto(req.body);
    dto.validate();
    try {
        const user =
            await prisma.user.findUnique({
                where: {email : dto.email}
            });

        if (!user) {
            return res.status(401).json({
                error:
                    "Email ou mot de passe invalide"
            });
        }

        const isValid =
            await comparePassword(
                dto.password,
                user.password
            );

        if (!isValid) {
            return res.status(401).json({
                error:
                    "Email ou mot de passe invalide"
            });
        }

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        return res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Erreur serveur"
        });
    }
}

const getAllUser = async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany();

        return res.status(200).json({
            success: true,
            count: allUsers.length,
            users: allUsers,
            message: "Liste des utilisateurs récupérée avec succès",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Erreur serveur",
        });
    }
};


module.exports = {
    register, login, getAllUser
}