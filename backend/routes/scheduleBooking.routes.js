import express from "express";
import {
    createBooking,
    getBookings,
    updateBooking,
} from "../controllers/scheduleBooking.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Anyone can create a booking (auth optional – we read req.user if present)
router.post("/", createBooking);

// Admin routes
router.use(protect);
router.get("/", getBookings);
router.patch("/:id", updateBooking);

export default router;
