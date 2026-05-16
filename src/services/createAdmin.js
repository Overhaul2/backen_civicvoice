const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const {prisma}= require("../config/db");

// create default admin user if not exists
const createAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingAdmin) {
            console.log("Admin déjà existant:", existingAdmin.email);
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create the admin user
        const newAdmin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                role: "ADMIN",
                isActive: true,
                isVerified: true,
            },
        });

        console.log("Admin créé avec succès:", newAdmin.email);
    } catch (error) {
        console.error("Erreur lors de la création de l'admin:", error.message);
    }
};

module.exports = createAdmin;