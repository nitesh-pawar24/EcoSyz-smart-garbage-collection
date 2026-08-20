import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: [
        "COMPANY_ADMIN", // Super Admin
        "ADMIN",        // Panchayat Admin
        "MANAGER",
        "STAFF",
        "SUPERVISOR",
        "EMPLOYEE",
      ],
      required: true,
    },
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      index: true,
    },
    permissions: [
      {
        type: String,
        enum: ["View", "Edit", "Delete"],
      },
    ],
    profilePhoto: {
      type: String, // URL
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("User", UserSchema);
