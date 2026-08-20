import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Panchayat from "../models/Panchayat.model.js";
import Subscription from "../models/Subscription.model.js";
import Household from "../models/Household.model.js";
import Company from "../models/company.model.js";
import Employee from "../models/Employee.model.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // Also check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided", success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Extract User Data based on Role
    if (decoded.role === "EMPLOYEE") {
      const employee = await Employee.findById(decoded.userId);
      if (employee) {
        req.user = {
          _id: employee._id,
          role: "EMPLOYEE",
          panchayatId: employee.panchayat,
          panchayat: employee.panchayat,
          wards: employee.wards || [],
          mobile: employee.phone,
        };
      }
    } else if (decoded.role === "HOUSEHOLD") {
      const household = await Household.findById(decoded.userId);
      if (household) {
        req.user = {
          _id: household._id,
          role: "HOUSEHOLD",
          panchayatId: household.panchayat,
          panchayat: household.panchayat,
          mobile: household.mobile,
        };
      }
    } else if (decoded.role === "COMPANY") {
      const company = await Company.findById(decoded.userId);
      if (company) {
        req.user = {
          _id: company._id,
          role: "COMPANY",
          panchayatId: company.panchayat,
          panchayat: company.panchayat,
          mobile: company.mobile,
        };
      }
    } else if (decoded.role === "ADMIN" || decoded.role === "PANCHAYAT_ADMIN") {
      const panchayat = await Panchayat.findById(decoded.userId);
      if (panchayat) {
        req.user = {
          _id: panchayat._id,
          role: "PANCHAYAT_ADMIN",
          panchayatId: panchayat._id,
          panchayat: panchayat._id,
          mobile: panchayat.contactPhone,
        };
      } else {
        // Handle User as Admin
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = {
            _id: user._id,
            role: user.role,
            panchayatId: user.panchayat,
            panchayat: user.panchayat,
            mobile: user.mobile,
          };
        }
      }
    } else {
      // 🔹 Fallback for other roles (Super Admin etc)
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = {
          _id: user._id,
          role: user.role,
          panchayatId: user.panchayat,
          panchayat: user.panchayat,
          mobile: user.mobile,
        };
      }
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔹 SUBSCRIPTION CHECK (Block access if EXPIRED past grace period)
    // Only block PANCHAYAT_ADMIN and EMPLOYEE roles. Prevent blocking COMPANY_ADMIN.
    if (
      (req.user.role === "PANCHAYAT_ADMIN" || req.user.role === "EMPLOYEE") &&
      !req.originalUrl.startsWith("/api/auth") &&
      req.user.panchayatId
    ) {
      const subscription = await Subscription.findOne({ panchayatId: req.user.panchayatId });
      if (subscription) {
        const graceEndDate = new Date(subscription.graceEndDate);
        if (new Date() > graceEndDate) {
          return res.status(403).json({
            success: false,
            message: "Subscription expired. Contact company for renewal.",
            errorCode: "SUBSCRIPTION_EXPIRED"
          });
        }
      }
    }

    return next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
