import Dustbin from "../models/dustbin.model.js";

// @desc    Create a new dustbin
// @route   POST /api/dustbins
// @access  Private (Admin)
export const createDustbin = async (req, res) => {
  try {
    const { binCode, locationText, type, ward, lat, lng } = req.body;

    const dustbin = await Dustbin.create({
      panchayat: req.user.panchayatId,
      binCode,
      locationText,
      type,
      ward,
      geo: { lat, lng },
    });

    res.status(201).json(dustbin);
  } catch (error) {
    console.error("Create Dustbin Error:", error);
    
    // Check for Duplicate Key Error (E11000)
    if (error.code === 11000) {
      if (error.message.includes("binCode")) {
        return res.status(400).json({ message: "A bin with this Bin Code already exists in your Panchayat. Please try again." });
      }
      return res.status(400).json({ message: "Duplicate entry detected. Please check your data." });
    }

    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all dustbins for the logged-in panchayat
// @route   GET /api/dustbins
// @access  Private (Admin/Supervisor)
export const getDustbins = async (req, res) => {
  try {
    const dustbins = await Dustbin.find({ panchayat: req.user.panchayatId, isActive: true });
    res.json(dustbins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single dustbin by ID
// @route   GET /api/dustbins/:id
// @access  Private
export const getDustbinById = async (req, res) => {
  try {
    const dustbin = await Dustbin.findById(req.params.id);
    if (!dustbin) return res.status(404).json({ message: "Dustbin not found" });

    // Ensure dustbin belongs to the user's panchayat
    if (dustbin.panchayat.toString() !== req.user.panchayatId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(dustbin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a dustbin
// @route   PUT /api/dustbins/:id
// @access  Private (Admin)
export const updateDustbin = async (req, res) => {
  try {
    const dustbin = await Dustbin.findById(req.params.id);
    if (!dustbin) return res.status(404).json({ message: "Dustbin not found" });

    if (dustbin.panchayat.toString() !== req.user.panchayatId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedDustbin = await Dustbin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedDustbin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a dustbin (Soft delete)
// @route   DELETE /api/dustbins/:id
// @access  Private (Admin)
export const deleteDustbin = async (req, res) => {
  try {
    const dustbin = await Dustbin.findById(req.params.id);
    if (!dustbin) return res.status(404).json({ message: "Dustbin not found" });

    if (dustbin.panchayat.toString() !== req.user.panchayatId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    dustbin.isActive = false;
    await dustbin.save();

    res.json({ message: "Dustbin removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
