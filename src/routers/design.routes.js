// routes/design.routes.js
import express from "express";
import {
  createDesign,
  getMyDesigns,
  getDesignById,
  updateDesignStatus,
  getAllDesigns,
  deleteDesign,
} from "../controllers/design.controller.js";
import { protect, isAdmin } from "../middlewares/user.middleware.js";

const router = express.Router();

// User routes
router.post("/", protect, createDesign);            // create design
router.get("/my", protect, getMyDesigns);           // get current user's designs
router.get("/:id", protect, getDesignById);         // get single design (owner or admin)
router.patch("/:id", protect, updateDesignStatus);  // owner updates or admin updates

router.delete("/:id", protect, deleteDesign);       // owner or admin can delete

// Admin routes
router.get("/", protect, isAdmin, getAllDesigns);   // admin: list all designs (optionally filter by status)

export default router;
