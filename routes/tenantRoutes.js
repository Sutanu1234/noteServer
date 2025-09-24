import express from "express";
import {
  upgradeTenantPlan,
  generateInviteCode,
  removeUser, 
  getTenant,
  getTenantPlan
} from "../controllers/tenantController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get tenant info with member
router.get("/:slug", protect, authorizeRoles("admin"), getTenant);

// Upgrade tenant plan (only admin)
router.post("/:slug/upgrade", protect, authorizeRoles("admin"), upgradeTenantPlan);
router.get("/:id/plan", protect, getTenantPlan);

// Generate new invite code (only admin)
router.post("/:slug/invite", protect, authorizeRoles("admin"), generateInviteCode);

router.delete("/:slug/users/:userId", protect, authorizeRoles("admin"), removeUser);

export default router;
