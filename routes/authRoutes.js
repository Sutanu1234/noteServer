import express from "express";
import {
  registerAdmin,
  registerMember,
  login,
  joinTenant,
  joinTenantViaLink,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin registration
router.post("/register/admin", registerAdmin);

// Member registration
router.post("/register/member", registerMember);

// Login
router.post("/login", login);

// Join existing tenant using invite code
router.post("/join", protect, joinTenant);

router.post("/join/:inviteCode", protect, joinTenantViaLink);

export default router;
