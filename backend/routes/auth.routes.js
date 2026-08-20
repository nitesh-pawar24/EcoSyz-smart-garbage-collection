import express from "express";
import {
  sendOtp,
  verifyOtpAndLogin,
  logout
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { checkSession } from "../controllers/auth.controller.js";
import {
  getProfile,
  updateProfile
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndLogin);
router.get("/me", protect, checkSession);

router.post("/logout", logout);


router.get("/me", protect, checkSession);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
