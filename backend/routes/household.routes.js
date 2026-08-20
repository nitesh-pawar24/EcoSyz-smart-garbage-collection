import express from "express";
import multer from "multer";
import path from "path";
import {
  registerHousehold,
  publicRegisterHousehold,
  getHouseholds,
  updateHousehold,
  updateHouseholdStatus,
  deleteHousehold,
} from "../controllers/household.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

// Multer storage for household documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});
const upload = multer({ storage });

const router = express.Router();

import { getDashboardData } from "../controllers/householdDashboard.controller.js";

// Public self-registration (no auth required)
router.post("/register", upload.fields([{ name: 'identity', maxCount: 1 }, { name: 'premises', maxCount: 1 }]), publicRegisterHousehold);

// Dashboard data (protected)
router.get("/dashboard", protect, getDashboardData);

// Admin-created registration (protected)
router.post("/", protect, registerHousehold);
router.get("/", protect, getHouseholds);
router.put("/:id", protect, allowRoles("PANCHAYAT_ADMIN"), updateHousehold);
router.patch("/:id/status", protect, allowRoles("PANCHAYAT_ADMIN"), updateHouseholdStatus);
router.delete("/:id", protect, allowRoles("PANCHAYAT_ADMIN"), deleteHousehold);

export default router;
