import express from "express";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenantMiddleware.js";

const router = express.Router();

// Protect routes and require tenant
router.use(protect);
router.use(requireTenant);

// Notes CRUD
router.post("/", createNote);
router.get("/", getNotes);
router.get("/:id", getNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
