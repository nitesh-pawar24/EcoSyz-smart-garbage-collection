import mongoose from "mongoose";

const attendanceScanSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
      index: true,
    },

    labour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    dustbin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dustbin",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    scannedAt: {
      type: Date,
      default: Date.now,
    },

    geo: {
      lat: Number,
      lng: Number,
    },

    distance: Number,

    isOffline: {
      type: Boolean,
      default: false,
    },

    estimatedWeight: {
      type: Number,
      default: 0,
    },

    action: {
      type: String,
      enum: ["collected", "issue"],
    },

    issueDescription: {
      type: String,
    },

    result: {
      type: String,
      enum: ["SUCCESS", "DUPLICATE", "OUT_OF_RANGE", "INVALID"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AttendanceScan", attendanceScanSchema);
