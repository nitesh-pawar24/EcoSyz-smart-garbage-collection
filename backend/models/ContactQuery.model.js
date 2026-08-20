import mongoose from "mongoose";

const contactQuerySchema = new mongoose.Schema(
    {
        panchayat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Panchayat",
            required: true,
            index: true,
        },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ["unread", "read", "replied"],
            default: "unread",
        },
    },
    { timestamps: true }
);

export default mongoose.model("ContactQuery", contactQuerySchema);
