// controllers/design.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Design } from "../models/design.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// controllers/design.controller.js
const uploadDir = path.join(process.cwd(), "uploads"); // use project root /uploads
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
}


function saveBase64Image(base64Data, fileName) {
   if (!base64Data || typeof base64Data !== "string") return null;
   const matches = base64Data.match(/^data:image\/([A-Za-z0-9+/]+);base64,(.+)$/);
   if (!matches || matches.length !== 3) return null;

   const imageBuffer = Buffer.from(matches[2], "base64");
   const filePath = path.join(uploadDir, fileName);
   fs.writeFileSync(filePath, imageBuffer);

   return `/uploads/${fileName}`;
}

export const createDesign = async (req, res) => {
   try {
      const { title, description, tshirtColor, frontImageBase64, backImageBase64, frontObjects, backObjects } = req.body;

      if (!title) return res.status(400).json({ message: "Title is required" });

      const frontPath = frontImageBase64 ? saveBase64Image(frontImageBase64, `front_${Date.now()}.png`) : null;

      const backPath = backImageBase64 ? saveBase64Image(backImageBase64, `back_${Date.now()}.png`) : null;

      const design = await Design.create({
         owner: req.user._id,
         title,
         description,
         tshirtColor,
         frontImageUrl: frontPath,
         backImageUrl: backPath,
         frontObjects: frontObjects || [],
         backObjects: backObjects || [],
      });

      return res.status(201).json({
         success: true,
         message: "Design created successfully",
         design,
      });
   } catch (error) {
      console.error("createDesign error:", error);
      return res.status(500).json({ message: "Failed to save design" });
   }
};

export const getMyDesigns = async (req, res) => {
   try {
      const designs = await Design.find({ owner: req.user._id }).sort({ createdAt: -1 });
      return res.json({ success: true, designs });
   } catch (error) {
      console.error("getMyDesigns error:", error);
      return res.status(500).json({ message: "Failed to fetch designs" });
   }
};

export const getDesignById = async (req, res) => {
   try {
      const design = await Design.findById(req.params.id);
      if (!design) return res.status(404).json({ message: "Design not found" });

      if (design.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
         return res.status(403).json({ message: "Access denied" });
      }

      return res.json({ success: true, design });
   } catch (error) {
      console.error("getDesignById error:", error);
      return res.status(500).json({ message: "Failed to fetch design" });
   }
};

export const getAllDesigns = async (req, res) => {
   try {
      const { status } = req.query;
      const filter = {};
      if (status) filter.status = status;

      const designs = await Design.find(filter).populate("owner", "firstname lastname email role").sort({ createdAt: -1 });

      return res.json({ success: true, designs });
   } catch (error) {
      console.error("getAllDesigns error:", error);
      return res.status(500).json({ message: "Failed to fetch designs" });
   }
};

export const updateDesignStatus = async (req, res) => {
   try {
      const { status, title, description, tshirtColor } = req.body;
      const design = await Design.findById(req.params.id);

      if (!design) return res.status(404).json({ message: "Design not found" });

      if (design.owner.toString() === req.user._id.toString()) {
         if (title !== undefined) design.title = title;
         if (description !== undefined) design.description = description;
         if (tshirtColor !== undefined) design.tshirtColor = tshirtColor;
         if (status && ["draft", "submitted"].includes(status)) design.status = status;

         await design.save();
         return res.json({ success: true, message: "Design updated", design });
      }

      if (req.user.role === "admin") {
         if (status && ["draft", "submitted", "approved", "rejected"].includes(status)) {
            design.status = status;
         }
         if (title !== undefined) design.title = title;
         if (description !== undefined) design.description = description;
         if (tshirtColor !== undefined) design.tshirtColor = tshirtColor;

         await design.save();
         return res.json({ success: true, message: "Design status updated", design });
      }

      return res.status(403).json({ message: "Unauthorized to update design" });
   } catch (error) {
      console.error("updateDesignStatus error:", error);
      return res.status(500).json({ message: "Failed to update design" });
   }
};

export const deleteDesign = async (req, res) => {
   try {
      const design = await Design.findById(req.params.id);
      if (!design) return res.status(404).json({ message: "Design not found" });

      if (design.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
         return res.status(403).json({ message: "Unauthorized to delete" });
      }

      // Remove files
      if (design.frontImageUrl) {
         const frontPath = path.join(__dirname, "..", design.frontImageUrl);
         if (fs.existsSync(frontPath)) fs.unlinkSync(frontPath);
      }
      if (design.backImageUrl) {
         const backPath = path.join(__dirname, "..", design.backImageUrl);
         if (fs.existsSync(backPath)) fs.unlinkSync(backPath);
      }

      await design.deleteOne();
      return res.json({ success: true, message: "Design deleted" });
   } catch (error) {
      console.error("deleteDesign error:", error);
      return res.status(500).json({ message: "Failed to delete design" });
   }
};
