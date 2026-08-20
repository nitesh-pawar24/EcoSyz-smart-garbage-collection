import express from "express";
import { createWard, getWards, updateWard, deleteWard, getWardDustbins, getPublicWards } from "../controllers/ward.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/public", getPublicWards);

router.use(protect);

router.post("/", createWard);
router.get("/", getWards);
router.put("/:id", updateWard);
router.delete("/:id", deleteWard);
router.get("/:id/dustbins", getWardDustbins);

export default router;
