// server.js
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import designRoutes from "./src/routers/design.routes.js";
import authRoutes from "./src/routers/user.route.js";

const app = express();

// CORS must come BEFORE routes
app.use(cors());

// Body parser middleware
app.use(express.json({ limit: "10mb" }));

// Static uploads folder expose
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/designs", designRoutes);

// Connect to DB
mongoose.connect(process.env.MONGO_DB)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));