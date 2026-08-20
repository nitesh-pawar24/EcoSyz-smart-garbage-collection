import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate ward names within the same panchayat
wardSchema.index({ panchayat: 1, name: 1 }, { unique: true });

export default mongoose.model("Ward", wardSchema);
