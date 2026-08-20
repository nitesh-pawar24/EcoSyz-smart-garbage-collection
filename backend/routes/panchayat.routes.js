import express from "express";
import {
  createPanchayat,
  listPanchayats,
  approvePanchayat,
  rejectPanchayat,
  getPanchayatById,
  updatePanchayatSettings
} from "../controllers/panchayat.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import { uploadPanchayatDocs } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", listPanchayats);
router.post("/register", uploadPanchayatDocs, createPanchayat);
router.get("/:id", getPanchayatById);
router.patch("/:id/settings", protect, updatePanchayatSettings);

router.patch(
  "/:id/approve",
  protect,
  allowRoles("COMPANY_ADMIN", "SUPER_ADMIN"),
  approvePanchayat
);

router.patch(
  "/:id/reject",
  protect,
  allowRoles("COMPANY_ADMIN", "SUPER_ADMIN"),
  rejectPanchayat
);

export default router;
