import mongoose from 'mongoose'
import WasteData from '../models/WasteData.model.js'

// Create new waste data entry
export const createWasteData = async (req, res) => {
  try {
    const { date, collectionType, ward, organic, recyclable, general } = req.body

    // Simple validation
    if (!date || !ward) {
      return res.status(400).json({ message: "Date and Ward are required" })
    }

    const org = parseFloat(organic) || 0
    const recycl = parseFloat(recyclable) || 0
    const gen = parseFloat(general) || 0
    const total = org + recycl + gen

    // Generate Entry ID robustly by finding max existing ID
    const allEntries = await WasteData.find({ panchayat: req.user.panchayatId }).select('entryId');
    let maxId = 0;
    allEntries.forEach(entry => {
      if (entry.entryId && entry.entryId.startsWith('W-')) {
        const num = parseInt(entry.entryId.replace('W-', ''), 10);
        if (!isNaN(num) && num > maxId) maxId = num;
      }
    });
    const entryId = `W-${String(maxId + 1).padStart(2, '0')}`;

    const newEntry = new WasteData({
      panchayat: req.user.panchayatId,
      entryId,
      date,
      collectionType,
      ward,
      organic: org,
      recyclable: recycl,
      general: gen,
      total
    })

    await newEntry.save()
    res.status(201).json(newEntry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all waste data entries
export const getAllWasteData = async (req, res) => {
  try {
    const wasteData = await WasteData.find({ panchayat: req.user.panchayatId }).sort({ createdAt: -1 })
    res.status(200).json(wasteData)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete waste data entry
export const deleteWasteData = async (req, res) => {
  try {
    const { id } = req.params
    const entry = await WasteData.findById(id)
    if (!entry) return res.status(404).json({ message: "Entry not found" })

    if (entry.panchayat.toString() !== req.user.panchayatId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this entry" })
    }

    await WasteData.findByIdAndDelete(id)
    res.status(200).json({ message: "Entry deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update waste data entry
export const updateWasteData = async (req, res) => {
  try {
    const { id } = req.params
    const { date, collectionType, ward, organic, recyclable, general } = req.body

    const entry = await WasteData.findById(id)
    if (!entry) return res.status(404).json({ message: "Entry not found" })

    if (entry.panchayat.toString() !== req.user.panchayatId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this entry" })
    }

    const org = parseFloat(organic) || 0
    const recycl = parseFloat(recyclable) || 0
    const gen = parseFloat(general) || 0
    const total = org + recycl + gen

    const updatedEntry = await WasteData.findByIdAndUpdate(
      id,
      {
        date,
        collectionType,
        ward,
        organic: org,
        recyclable: recycl,
        general: gen,
        total
      },
      { new: true }
    )

    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry not found" })
    }

    res.status(200).json(updatedEntry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get waste stats
export const getWasteStats = async (req, res) => {
  try {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0)

    const panchayatId = new mongoose.Types.ObjectId(req.user.panchayatId)

    const weeklyTotal = await WasteData.aggregate([
      { $match: { panchayat: panchayatId, date: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ])

    const monthlyTotal = await WasteData.aggregate([
      { $match: { panchayat: panchayatId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ])

    const lastMonthTotal = await WasteData.aggregate([
      { $match: { panchayat: panchayatId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ])

    // Weekly Data for Chart (Mon-Sun daily totals)
    const weeklyData = await WasteData.aggregate([
      { $match: { panchayat: panchayatId, date: { $gte: startOfWeek } } },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          total: { $sum: "$total" },
        }
      },
      { $sort: { "_id": 1 } }
    ])

    // Mapping day numbers to labels
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedWeeklyData = dayNames.map((name, index) => {
      const match = weeklyData.find(d => d._id === (index + 1));
      return { day: name, total: match ? match.total : 0 };
    });

    // Monthly Type Breakdown for Pie Chart
    const typeBreakdown = await WasteData.aggregate([
      { $match: { panchayat: panchayatId, date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          organic: { $sum: "$organic" },
          recyclable: { $sum: "$recyclable" },
          general: { $sum: "$general" },
        }
      }
    ])

    const formattedTypeBreakdown = [
      { name: "Organic", value: typeBreakdown[0]?.organic || 0 },
      { name: "Recyclable", value: typeBreakdown[0]?.recyclable || 0 },
      { name: "General", value: typeBreakdown[0]?.general || 0 },
    ].filter(item => item.value > 0);

    const recentCollections = await WasteData.find({ panchayat: req.user.panchayatId }).sort({ date: -1 }).limit(10)

    res.status(200).json({
      weeklyTotal: weeklyTotal[0]?.total || 0,
      monthlyTotal: monthlyTotal[0]?.total || 0,
      lastMonthTotal: lastMonthTotal[0]?.total || 0,
      weeklyData: formattedWeeklyData,
      typeBreakdown: formattedTypeBreakdown,
      recentCollections
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
