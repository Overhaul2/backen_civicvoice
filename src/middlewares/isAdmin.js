

const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Accès refusé : ADMIN uniquement",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Non autorisé",
    });
  }
};

module.exports = isAdmin;