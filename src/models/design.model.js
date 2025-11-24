// models/design.model.js
import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
   {
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      title: {
         type: String,
         required: true,
      },
      description: {
         type: String,
      },
      frontImageUrl: {
         type: String,
      },
      backImageUrl: {
         type: String,
      },
      // Store the actual fabric.js objects for proper loading/editing
      frontObjects: {
         type: Array,
         default: [],
      },
      backObjects: {
         type: Array,
         default: [],
      },
      tshirtColor: {
         type: String,
         default: "#FFFFFF",
      },
      status: {
         type: String,
         enum: ["draft", "submitted", "approved", "rejected"],
         default: "draft",
      },
   },
   { timestamps: true }
);

export const Design = mongoose.model("Design", designSchema);
