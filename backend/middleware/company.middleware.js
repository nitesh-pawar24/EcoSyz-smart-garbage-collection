export const isCompanyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Company admin has NO panchayatId
  if (req.user.role === "COMPANY_ADMIN" && !req.user.panchayatId) {
    return next();
  }



  return res.status(403).json({ message: "Company access only" });
};

