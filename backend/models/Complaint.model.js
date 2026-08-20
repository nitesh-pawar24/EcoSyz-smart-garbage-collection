import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
      index: true,
    },
    ward: {
      type: String,
    },
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
      // optional if public user isn't logged in, but let's assume linked for now or allow free text
    },
    reporterName: { type: String, required: true },
    reporterMobile: { type: String, required: true },
    
    type: {
      type: String,
      enum: ["Missed Bin", "Not Segregated", "Hazardous Waste", "Civic Issue", "Other"],
      required: true,
    },
    description: { type: String },
    photo: { type: String }, // URL
    
    status: {
      type: String,
      enum: ["Received", "In Progress", "Resolved"],
      default: "Received",
    },
    
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    
    geo: {
      lat: Number,
      lng: Number,
    },
    
    resolvedAt: Date,
    resolutionTime: String,
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
