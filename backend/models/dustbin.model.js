import mongoose from "mongoose";

const dustbinSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
      index: true,
    },

    binCode: {
      type: String,
      required: true,
      trim: true,
    },

    locationText: {
      type: String,
      required: true,
      trim: true,
    },

    ward: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["General", "Recyclable", "Organic"],
      default: "General",
    },

    status: {
      type: String,
      enum: ["Good", "Damaged", "Need Replacement"],
      default: "Good",
    },

    geo: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },

    qrEnabled: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate bin codes per panchayat
dustbinSchema.index({ panchayat: 1, binCode: 1 }, { unique: true });

export default mongoose.model("Dustbin", dustbinSchema);
