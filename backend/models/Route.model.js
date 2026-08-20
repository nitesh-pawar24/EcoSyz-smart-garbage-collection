import mongoose from "mongoose";

const pointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  estimatedTime: { type: String }, // e.g., "10:30 AM"
});

const routeSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
    },
    routeName: {
      type: String,
      required: true,
    },
    routeCode: {
      type: String,
      required: true,
      unique: true,
    },
    details: {
      type: String,
    },
    stops: [
      {
        stopName: { type: String, required: true },
        // lat, lng, estimatedTime can be added later if needed
      }
    ],
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    assignedVehicle: {
      type: String, // Vehicle number
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Route", routeSchema);
