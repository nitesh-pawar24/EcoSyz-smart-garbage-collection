export const allowRoles = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {

      return res.status(403).json({ 
        message: `Access denied. Your role (${req.user.role}) does not have permission for this action.`,
        success: false
      });
    }
    next();
  };
};
