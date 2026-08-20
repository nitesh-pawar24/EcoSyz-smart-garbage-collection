import Panchayat from '../models/Panchayat.model.js'

export const getCompanyDashboard = async (req, res) => {
  try {
    const totalPanchayats = await Panchayat.countDocuments()
    const activeSubscriptions = await Panchayat.countDocuments({ status: 'active' }) // Assuming active panchayats have active subs
    const pendingRequests = await Panchayat.countDocuments({ status: 'pending' })

    res.status(200).json({
      totalPanchayats,
      activeSubscriptions,
      pendingRequests
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
