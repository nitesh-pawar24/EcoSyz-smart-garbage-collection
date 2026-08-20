import Household from "../models/Household.model.js";

// @desc    Register a new household (Public Self-Registration)
// @route   POST /api/households/register (public)
// @access  Public
export const publicRegisterHousehold = async (req, res) => {
  try {
    const { ownerName, mobile, houseNumber, address, ward, panchayatId, email } = req.body;

    if (!panchayatId || !ownerName || !mobile || !houseNumber || !address || !ward) {
      return res.status(400).json({ message: "All fields are required.", success: false });
    }

    // Prevent duplicate registration for same mobile + panchayat
    const existing = await Household.findOne({ mobile, panchayat: panchayatId });
    if (existing) {
      return res.status(409).json({ message: "A household with this mobile number is already registered in this Panchayat.", success: false });
    }

    const identityDoc = req.files?.identity?.[0]?.filename || null;
    const premisesDoc = req.files?.premises?.[0]?.filename || null;

    const household = await Household.create({
      panchayat: panchayatId,
      ownerName,
      mobile,
      houseNumber,
      address,
      ward,
      email: email || undefined,
      identityDoc,
      premisesDoc,
      status: "Pending", // Will appear in admin panel for approval
    });

    res.status(201).json({ message: "Registration request submitted successfully! Your application is under review.", success: true, household });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// @desc    Register a new household (Admin)
// @route   POST /api/households
// @access  Private (Admin)
export const registerHousehold = async (req, res) => {
  try {
    const { ownerName, mobile, houseNumber, address, ward, panchayatId, lat, lng } = req.body;

    // Determine Panchayat ID:
    // 1. From Authenticated User (Admin/Staff)
    // 2. From Request Body (Public Registration - if we allow it later without auth, but for now we protected the route)
    const activePanchayatId = req.user?.panchayatId || panchayatId;

    if (!activePanchayatId) {
      return res.status(400).json({ message: "Panchayat ID is required." });
    }

    const household = await Household.create({
      panchayat: activePanchayatId,
      ownerName,
      mobile,
      houseNumber,
      address,
      ward,
      geo: { lat, lng },
    });

    res.status(201).json(household);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all households for a panchayat
// @route   GET /api/households
// @access  Private (Admin)
export const getHouseholds = async (req, res) => {
  try {
    const households = await Household.find({ panchayat: req.user.panchayatId });
    res.json(households);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update household details
// @route   PUT /api/households/:id
// @access  Private (Admin)
export const updateHousehold = async (req, res) => {
  try {
    const { ownerName, mobile, houseNumber, address, ward, segregationCompliance } = req.body;
    const household = await Household.findById(req.params.id);

    if (!household) return res.status(404).json({ message: "Household not found" });

    if (household.panchayat.toString() !== req.user.panchayatId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    household.ownerName = ownerName || household.ownerName;
    household.mobile = mobile || household.mobile;
    household.houseNumber = houseNumber || household.houseNumber; // Although usually not editable, allowing corrections
    household.address = address || household.address;
    household.ward = ward || household.ward;
    household.segregationCompliance = segregationCompliance || household.segregationCompliance;

    await household.save();

    res.json(household);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update household status (Approve/Reject)
// @route   PATCH /api/households/:id/status
// @access  Private (Admin)
export const updateHouseholdStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const household = await Household.findById(req.params.id);

    if (!household) return res.status(404).json({ message: "Household not found" });

    if (household.panchayat.toString() !== req.user.panchayatId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    household.status = status;
    await household.save();

    res.json(household);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete a household
// @route   DELETE /api/households/:id
// @access  Private (Admin)
export const deleteHousehold = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);

    if (!household) return res.status(404).json({ message: "Household not found" });

    if (household.panchayat.toString() !== req.user.panchayatId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await household.deleteOne();
    res.json({ message: "Household removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
