import mongoose from "mongoose";

const scheduleBookingSchema = new mongoose.Schema(
    {
        panchayat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Panchayat",
            required: true,
            index: true,
        },
        household: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Household",
        },
        userName: { type: String },
        userMobile: { type: String },
        wasteType: {
            type: String,
            enum: ["Organic", "Recyclable", "Hazardous", "Bulk Items"],
            required: true,
        },
        date: { type: String, required: true },
        time: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String },
        note: { type: String },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("ScheduleBooking", scheduleBookingSchema);
