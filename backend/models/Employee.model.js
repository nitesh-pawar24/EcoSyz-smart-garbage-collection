import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },

    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    phone: { type: String, required: true },
    address: { type: String, required: true },

    role: {
      type: String,
      enum: ["Collector", "Driver", "Supervisor", "Helper"],
      required: true,
    },

    wards: [{ type: String, required: true }],

    // DOB
    dateOfBirth: {
      type: Date,
      required: true,
    },

    // system joining date
    joiningDate: {
      type: Date,
      default: Date.now,
    },

    documents: {
      photo: String,
      idProof: String,
      license: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
