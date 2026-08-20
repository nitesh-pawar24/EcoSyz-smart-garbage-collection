import ContactQuery from "../models/ContactQuery.model.js";

// POST /api/contact-queries  (Public)
export const createContactQuery = async (req, res) => {
    try {
        const { panchayatId, name, email, message } = req.body;
        if (!panchayatId || !name || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const query = await ContactQuery.create({ panchayat: panchayatId, name, email, message });
        res.status(201).json(query);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/contact-queries  (Admin – protected)
export const getContactQueries = async (req, res) => {
    try {
        const queries = await ContactQuery.find({ panchayat: req.user.panchayatId })
            .sort({ createdAt: -1 });
        res.json(queries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/contact-queries/:id  (Admin – mark read/replied)
export const updateContactQuery = async (req, res) => {
    try {
        const { status } = req.body;
        const query = await ContactQuery.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!query) return res.status(404).json({ message: "Query not found" });
        res.json(query);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/contact-queries/:id  (Admin)
export const deleteContactQuery = async (req, res) => {
    try {
        await ContactQuery.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
