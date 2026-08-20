import express from "express";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  activateEmployee,
} from "../controllers/employee.controller.js";
import { employeeUpload } from "../middleware/employeeUpload.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* 🔐 AUTH REQUIRED */
router.use(protect);

/* ➕ CREATE */
router.post(
  "/",
  employeeUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "license", maxCount: 1 },
  ]),
  createEmployee
);

/* 📋 LIST */
router.get("/", getEmployees);

/* 🔍 SINGLE */
router.get("/:id", getEmployeeById);

/* ✏️ UPDATE */
router.put(
  "/:id",
  employeeUpload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "license", maxCount: 1 },
  ]),
  updateEmployee
);

/* ⛔ DEACTIVATE */
router.put("/:id/deactivate", deactivateEmployee);

/* ✅ ACTIVATE */
router.put("/:id/activate", activateEmployee);

export default router;
