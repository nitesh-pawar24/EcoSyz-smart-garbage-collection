import express from "express";
import {
  createDustbin,
  getDustbins,
  getDustbinById,
  updateDustbin,
  deleteDustbin,
} from "../controllers/dustbin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route("/")
  .post(allowRoles("PANCHAYAT_ADMIN"), createDustbin) // Only Admin can create
  .get(getDustbins); // Admin, Supervisor, etc. can view

router
  .route("/:id")
  .get(getDustbinById)
  .put(allowRoles("PANCHAYAT_ADMIN"), updateDustbin)
  .delete(allowRoles("PANCHAYAT_ADMIN"), deleteDustbin);

export default router;
