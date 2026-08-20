import jwt from "jsonwebtoken";
import Employee from "../models/Employee.model.js";

export const employeeProtect = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "EMPLOYEE") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const employee = await Employee.findById(decoded.employeeId);
    if (!employee || employee.status !== "active") {
      return res.status(401).json({ message: "Invalid employee" });
    }

    req.employee = employee;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
