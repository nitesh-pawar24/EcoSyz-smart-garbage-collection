import express from "express";
import { getContent, saveContent, uploadContentMedia, getPublicContent } from "../controllers/content.controller.js";
import { protect } from "../middleware/auth.middleware.js";
// I will import from generic location or split. 
// Wait, I just fixed route.routes.js to use roleMiddleware.js. I should do the same here.
import { allowRoles as allowRolesMiddleware } from "../middleware/roleMiddleware.js";
import { uploadContent } from "../middleware/contentUpload.middleware.js";

const router = express.Router();

// Public route (Must be before global protect middleware if applied globally, or we move middleware down)
// Actually, earlier I saw `router.use(protect)` at line 11. This blocks everything below it.
// We should define public routes ABOVE that line.

router.get("/public/:panchayatId", getPublicContent);

// --- PROTECTED ROUTES ---
router.use(protect);
router.use(allowRolesMiddleware("PANCHAYAT_ADMIN"));

router.get("/", getContent); // ?type=about-us
router.post("/", saveContent);
router.post("/upload", uploadContent, uploadContentMedia);

export default router;
