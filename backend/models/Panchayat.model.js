import mongoose from "mongoose";

const PanchayatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    inchargeName: {
      type: String,
      required: true,
    },

    contactPhone: {
      type: String,
      required: true,
    },

    contactEmail: {
      type: String,
    },

    website: {
      type: String,
    },

    estHouseholds: {
      type: String,
    },

    estLabours: {
      type: String,
    },

    documents: {
      inchargeIdProof: { type: String },        // filename
      registrationLetter: { type: String },     // filename
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
    isScheduleEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Panchayat || mongoose.model("Panchayat", PanchayatSchema);
