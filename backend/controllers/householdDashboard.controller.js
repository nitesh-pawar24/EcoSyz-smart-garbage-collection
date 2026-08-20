import Household from '../models/Household.model.js'
import ScheduleBooking from '../models/ScheduleBooking.model.js'
import Complaint from '../models/Complaint.model.js'
import mongoose from 'mongoose'

export const getDashboardData = async (req, res) => {
  try {
    const userMobile = req.user.mobile

    // Find the household linked to this user's mobile number
    const household = await Household.findOne({ mobile: userMobile })

    if (!household) {
      return res.status(404).json({ message: 'Household not found for this user.' })
    }

    const householdId = household._id

    // 1. Total Pickups (Completed)
    const totalPickupsCount = await ScheduleBooking.countDocuments({
      $or: [{ household: householdId }, { userMobile: userMobile }],
      status: 'Completed',
    })

    // 2. This Month Pickups (Scheduled for this month)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const endOfMonth = new Date(startOfMonth)
    endOfMonth.setMonth(startOfMonth.getMonth() + 1)

    // Note: The `date` field in ScheduleBooking is stored as a string.
    // We will find all bookings for this household and filter by date.
    // Alternatively, if it's a "Pending" or "Confirmed" status, we consider it scheduled.
    const allHouseholdBookings = await ScheduleBooking.find({
      $or: [{ household: householdId }, { userMobile: userMobile }],
    })

    const thisMonthPickups = allHouseholdBookings.filter((booking) => {
      const bookingDate = new Date(booking.date)
      return bookingDate >= startOfMonth && bookingDate < endOfMonth
    }).length

    // 3. Open Complaints
    const openComplaintsCount = await Complaint.countDocuments({
      reporterMobile: userMobile,
      status: { $ne: 'Resolved' },
    })

    // 4. Upcoming Pickups (Next 5 Pending/Confirmed)
    const upcomingPickupsAll = allHouseholdBookings
      .filter((booking) => ['Pending', 'Confirmed'].includes(booking.status))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const upcomingPickups = upcomingPickupsAll.slice(0, 5)

    // 5. Eco Score (Compliance)
    // Map segregationCompliance to a score, or calculate based on history
    let ecoScore = 100 // Default
    if (household.segregationCompliance === 'Non-Compliant') {
      ecoScore = 50
    } else if (household.segregationCompliance === 'Compliant') {
      ecoScore = 95
    }

    // Return aggregated data
    res.status(200).json({
      totalPickups: totalPickupsCount,
      thisMonthPickups: thisMonthPickups,
      openComplaints: openComplaintsCount,
      ecoScore: ecoScore,
      upcomingPickups: upcomingPickups,
      householdData: {
        score: ecoScore,
        compliance: household.segregationCompliance,
      },
    })
  } catch (error) {
    console.error('Error fetching household dashboard data:', error)
    res.status(500).json({ message: 'Server error fetching dashboard data.' })
  }
}
