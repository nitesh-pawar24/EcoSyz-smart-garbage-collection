import express from "express";
import { createSubscription } from "../controllers/subscription.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { listAllSubscriptions } from "../controllers/subscription.controller.js";
import {
  reactivateSubscription,
  upgradeSubscription,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("COMPANY_ADMIN"),
  createSubscription
);

router.get(
  "/",
  protect,
  allowRoles("COMPANY_ADMIN"),
  listAllSubscriptions
);

router.put(
  "/:subscriptionId/reactivate",
  protect,
  allowRoles("COMPANY_ADMIN"),
  reactivateSubscription
);

router.put(
  "/:subscriptionId/upgrade",
  protect,
  allowRoles("COMPANY_ADMIN"),
  upgradeSubscription
);

export default router;
