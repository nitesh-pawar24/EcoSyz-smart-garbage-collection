import express from "express";
import {
  submitQuery,
  submitFeedback,
  getCommittee,
  getAttendanceHistory,
} from "../controllers/employee.app.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/query", protect, submitQuery);
router.post("/feedback", protect, submitFeedback);
router.get("/committee", protect, getCommittee);
router.get("/attendance-history", protect, getAttendanceHistory);

export default router;
