import express from "express";
import {
    createContactQuery,
    getContactQueries,
    updateContactQuery,
    deleteContactQuery,
} from "../controllers/contactQuery.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: submit a contact query
router.post("/", createContactQuery);

// Admin-protected
router.use(protect);
router.get("/", getContactQueries);
router.patch("/:id", updateContactQuery);
router.delete("/:id", deleteContactQuery);

export default router;
