import express from "express";
import {
  createComplaint,
  getComplaints,
  getMyComplaints,
  updateComplaintStatus,
  getComplaintStats,
} from "../controllers/complaint.controller.js";
import { protect } from "../middleware/auth.middleware.js";

import { complaintUpload } from "../middleware/complaintUpload.middleware.js";

const router = express.Router();

router.post("/", complaintUpload.single("photo"), createComplaint); // Public
router.get("/me", protect, getMyComplaints);
router.get("/stats", protect, getComplaintStats);
router.get("/", protect, getComplaints);
router.patch("/:id", protect, updateComplaintStatus);

export default router;
