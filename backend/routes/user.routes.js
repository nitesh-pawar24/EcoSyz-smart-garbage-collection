import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.post("/", upload.single("photo"), createUser);
router.put("/:id", upload.single("photo"), updateUser);
router.delete("/:id", deleteUser);

export default router;
