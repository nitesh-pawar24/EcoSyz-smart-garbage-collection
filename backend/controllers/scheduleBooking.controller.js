import ScheduleBooking from "../models/ScheduleBooking.model.js";
import Panchayat from "../models/Panchayat.model.js";

// POST /api/schedule-bookings  (Auth – household user)
export const createBooking = async (req, res) => {
    try {
        const { panchayatId, wasteType, date, time, address, phone, note } = req.body;
        if (!panchayatId || !wasteType || !date || !time || !address) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const panchayat = await Panchayat.findById(panchayatId);
        if (!panchayat || !panchayat.isScheduleEnabled) {
            return res.status(403).json({ message: "Schedule pickup is currently disabled for this Panchayat" });
        }

        const user = req.user;
        // req.user.mobile is populated from DB by auth middleware — use it as the
        // authoritative phone source so the number is always saved even when the
        // user leaves the optional phone field blank in the form.
        const resolvedPhone = phone?.trim() || user?.mobile || "";
        const booking = await ScheduleBooking.create({
            panchayat: panchayatId,
            household: user?._id || undefined,
            userName: user?.name || req.body.userName,
            userMobile: resolvedPhone,
            wasteType, date, time, address,
            phone: resolvedPhone,
            note,
        });
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/schedule-bookings  (Admin)
export const getBookings = async (req, res) => {
    try {
        const bookings = await ScheduleBooking.find({ panchayat: req.user.panchayatId })
            .populate("household", "mobile ownerName")
            .sort({ createdAt: -1 });

        // Normalise phone: for old records that have no phone/userMobile stored,
        // fall back to the populated household's mobile.
        const normalised = bookings.map(b => {
            const doc = b.toObject();
            doc.phone = doc.phone || doc.userMobile || b.household?.mobile || "";
            return doc;
        });

        res.json(normalised);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/schedule-bookings/:id  (Admin)
export const updateBooking = async (req, res) => {
    try {
        const booking = await ScheduleBooking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
