const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role?.toLowerCase();

    const hasPermission = allowedRoles
      .map((role) => role.toLowerCase())
      .includes(userRole);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};