import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
   {
      firstname: {
         type: String,
         required: [true, "Name is required"],
         trim: true,
         maxLength: [50, "Name must be at most 50 characters long"],
      },
      lastname: {
         type: String,
         required: [true, "Lastname is required"],
         trim: true,
         maxLength: [50, "Lastname must be at most 50 characters long"],
      },
      email: {
         type: String,
         required: [true, "Email is required"],
         trim: true,
         lowercase: true,
         unique: [true, "Email already in use"],
         match: [/.+@.+\..+/, "Please enter a valid email address"],
      },
      password: {
         type: String,
         required: [true, "Password is required"],
         trim: true,
         minLength: [8, "Password must be at least 8 characters long"],
      },
      role: {
         type: String,
         enum: ["user", "admin"],
         default: "user",
      },
      cabinet: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Design",
         },
      ],
      isVerified: {
         type: Boolean,
         default: false,
      },
      verificationToken: String,
      resetPasswordToken: String,
      resetPasswordExpire: Date,
   },
   { timestamps: true }
);

userSchema.pre("save", async function (next) {
   if (!this.isModified("password") || !this.password) return next();
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
   return bcrypt.compare(enteredPassword, this.password);
};

userSchema.set("toJSON", {
   transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
   },
});

export const User = mongoose.model("User", userSchema);
