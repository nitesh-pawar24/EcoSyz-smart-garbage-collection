import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
    },
    issueType: {
      type: String,
      enum: [
        "Payment Issue",
        "Technical Bug",
        "Subscription Inquiry",
        "Login Issue",
        "General Inquiry",
        "Other",
      ],
      default: "General Inquiry",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
