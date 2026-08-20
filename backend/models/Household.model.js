import mongoose from "mongoose";

const householdSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
      index: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    houseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    identityDoc: { type: String },   // filename stored by multer
    premisesDoc: { type: String },   // filename stored by multer
    segregationCompliance: {
      type: String,
      enum: ["Compliant", "Non-Compliant"],
      default: "Compliant",
    },
    qrCode: {
      type: String, // Unique QR content for household
      unique: true,
      sparse: true,
    },
    geo: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Household", householdSchema);
