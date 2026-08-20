import Ward from "../models/Ward.model.js";
import Dustbin from "../models/dustbin.model.js";

/* ================= CREATE ================= */
export const createWard = async (req, res) => {
  try {
    const { name } = req.body;
    const panchayatId = req.user.panchayatId;

    const ward = await Ward.create({
      panchayat: panchayatId,
      name,
    });

    res.status(201).json(ward);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Ward name already exists in this panchayat" });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ================= LIST ================= */
export const getWards = async (req, res) => {
  try {
    const panchayatId = req.user.panchayatId;
    const wards = await Ward.find({ panchayat: panchayatId }).sort({ name: 1 });

    // For each ward, get the count of allotted dustbins
    const wardsWithStats = await Promise.all(
      wards.map(async (ward) => {
        const dustbinCount = await Dustbin.countDocuments({
          panchayat: panchayatId,
          ward: ward.name, // Assuming ward name is used in Dustbin model's ward field
          isActive: true,
        });
        return {
          ...ward.toObject(),
          dustbinCount,
        };
      })
    );

    res.json(wardsWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= PUBLIC LIST ================= */
export const getPublicWards = async (req, res) => {
  try {
    const { panchayatId } = req.query;
    if (!panchayatId) {
      return res.status(400).json({ message: "Panchayat ID is required" });
    }
    const wards = await Ward.find({ panchayat: panchayatId }).sort({ name: 1 });
    res.json(wards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateWard = async (req, res) => {
  try {
    const { name } = req.body;
    const panchayatId = req.user.panchayatId;

    const ward = await Ward.findOneAndUpdate(
      { _id: req.params.id, panchayat: panchayatId },
      { name },
      { new: true }
    );

    if (!ward) return res.status(404).json({ message: "Ward not found" });

    res.json(ward);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Ward name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */
export const deleteWard = async (req, res) => {
  try {
    const panchayatId = req.user.panchayatId;
    const ward = await Ward.findOneAndDelete({ _id: req.params.id, panchayat: panchayatId });

    if (!ward) return res.status(404).json({ message: "Ward not found" });

    res.json({ message: "Ward deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET WARD DUSTBINS ================= */
export const getWardDustbins = async (req, res) => {
  try {
    const panchayatId = req.user.panchayatId;
    const ward = await Ward.findOne({ _id: req.params.id, panchayat: panchayatId });

    if (!ward) return res.status(404).json({ message: "Ward not found" });

    const dustbins = await Dustbin.find({
      panchayat: panchayatId,
      ward: ward.name,
      isActive: true,
    });

    res.json(dustbins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
