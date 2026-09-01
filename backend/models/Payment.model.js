import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
    },
    planName: {
      type: String,
      enum: ["Basic", "Standard", "Premium", "BASIC", "STANDARD", "PREMIUM"],
      default: "Standard",
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Successful", "Pending", "Failed"],
      default: "Successful",
    },
    paymentMethod: {
      type: String,
      default: "Online / NetBanking",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
