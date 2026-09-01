import Panchayat from '../models/Panchayat.model.js'
import Subscription from '../models/Subscription.model.js'
import Payment from '../models/Payment.model.js'
import Ticket from '../models/Ticket.model.js'

/**
 * Super Admin Dashboard Metrics
 */
export const getCompanyDashboard = async (req, res) => {
  try {
    // Only count non-rejected panchayats
    const totalPanchayats = await Panchayat.countDocuments({ status: { $ne: 'rejected' } })
    
    const activePanchayats = await Panchayat.find({ status: { $ne: 'rejected' } }).select('_id')
    const activePanchayatIds = activePanchayats.map(p => p._id)

    // Count active subscriptions for valid panchayats
    let activeSubscriptions = await Subscription.countDocuments({
      panchayatId: { $in: activePanchayatIds },
      status: { $in: ['ACTIVE', 'Active'] }
    })
    
    if (activeSubscriptions === 0) {
      activeSubscriptions = await Panchayat.countDocuments({ status: 'active' })
    }

    const pendingRequests = await Panchayat.countDocuments({ status: 'pending' })

    res.status(200).json({
      totalPanchayats,
      activeSubscriptions,
      pendingRequests
    })
  } catch (error) {
    console.error('getCompanyDashboard error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * Seed initial real-linked data if collections are empty (only for non-rejected panchayats)
 */
const ensureInitialCompanyData = async () => {
  try {
    const panchayats = await Panchayat.find({ status: { $ne: 'rejected' } }).sort({ createdAt: 1 })
    if (!panchayats || panchayats.length === 0) return

    // 1. Check Payments
    const paymentCount = await Payment.countDocuments()
    if (paymentCount === 0) {
      const plans = [
        { plan: 'Basic', amount: 1499 },
        { plan: 'Standard', amount: 2699 },
        { plan: 'Premium', amount: 5999 },
      ]
      
      const seedPayments = panchayats.map((p, idx) => {
        const selected = plans[idx % plans.length]
        const status = idx === 3 ? 'Failed' : idx === 4 ? 'Pending' : 'Successful'
        
        return {
          panchayat: p._id,
          planName: selected.plan,
          amount: selected.amount,
          paymentDate: new Date(Date.now() - idx * 86400000 * 2),
          transactionId: `pay_${(idx + 1).toString().padStart(4, '0')}`,
          status,
          paymentMethod: 'Online / NetBanking'
        }
      })

      if (seedPayments.length > 0) {
        await Payment.insertMany(seedPayments)
        console.log(`Seeded ${seedPayments.length} initial payment records`)
      }
    }

    // 2. Check Tickets
    const ticketCount = await Ticket.countDocuments()
    if (ticketCount === 0) {
      const issueTypes = [
        'Payment Issue',
        'Technical Bug',
        'Subscription Inquiry',
        'Login Issue',
        'General Inquiry'
      ]
      const statuses = ['Open', 'In Progress', 'Resolved', 'Resolved']
      const descriptions = [
        'Payment was deducted but subscription status is taking time to reflect.',
        'Encountered error while exporting monthly waste reports.',
        'Inquiring about upgrading to Premium plan for additional ward coverage.',
        'Unable to log in with secondary supervisor account credentials.',
        'Requesting assistance with dustbin QR code generation.'
      ]

      const seedTickets = panchayats.slice(0, 5).map((p, idx) => ({
        ticketId: `T-${(idx + 1).toString().padStart(2, '0')}`,
        panchayat: p._id,
        issueType: issueTypes[idx % issueTypes.length],
        status: statuses[idx % statuses.length],
        description: descriptions[idx % descriptions.length],
        createdAt: new Date(Date.now() - idx * 86400000)
      }))

      if (seedTickets.length > 0) {
        await Ticket.insertMany(seedTickets)
        console.log(`Seeded ${seedTickets.length} initial support tickets`)
      }
    }
  } catch (err) {
    console.error('ensureInitialCompanyData error:', err)
  }
}

/**
 * Get All Payments & Overview Stats (Excluding rejected panchayats)
 */
export const getCompanyPayments = async (req, res) => {
  try {
    await ensureInitialCompanyData()

    const activePanchayats = await Panchayat.find({ status: { $ne: 'rejected' } }).select('_id')
    const activePanchayatIds = activePanchayats.map(p => p._id)

    const [successful, pending, failed, allPayments] = await Promise.all([
      Payment.countDocuments({ status: 'Successful', panchayat: { $in: activePanchayatIds } }),
      Payment.countDocuments({ status: 'Pending', panchayat: { $in: activePanchayatIds } }),
      Payment.countDocuments({ status: 'Failed', panchayat: { $in: activePanchayatIds } }),
      Payment.find({ panchayat: { $in: activePanchayatIds } })
        .populate('panchayat', 'name status')
        .sort({ paymentDate: -1 })
    ])

    const formattedPayments = allPayments
      .filter(p => p.panchayat && p.panchayat.status !== 'rejected')
      .map(p => ({
        id: p._id,
        panchayatName: p.panchayat?.name || 'Unknown Panchayat',
        planName: p.planName ? (p.planName.charAt(0).toUpperCase() + p.planName.slice(1).toLowerCase()) : 'Standard',
        amount: `₹${(p.amount || 0).toLocaleString('en-IN')}`,
        rawAmount: p.amount,
        paymentDate: new Date(p.paymentDate).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        transactionId: p.transactionId,
        status: p.status || 'Pending',
        paymentMethod: p.paymentMethod || 'Online'
      }))

    res.status(200).json({
      stats: {
        successful,
        pending,
        failed
      },
      payments: formattedPayments
    })
  } catch (error) {
    console.error('getCompanyPayments error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * Create Payment record
 */
export const createPayment = async (req, res) => {
  try {
    const { panchayatId, planName, amount, status, paymentMethod } = req.body

    const txId = `pay_${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`

    const payment = await Payment.create({
      panchayat: panchayatId,
      planName: planName || 'Standard',
      amount: Number(amount) || 2699,
      paymentDate: new Date(),
      transactionId: txId,
      status: status || 'Successful',
      paymentMethod: paymentMethod || 'Online / NetBanking'
    })

    res.status(201).json(payment)
  } catch (error) {
    console.error('createPayment error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * Get All Support Tickets & Overview Stats (Excluding rejected panchayats)
 */
export const getCompanyTickets = async (req, res) => {
  try {
    await ensureInitialCompanyData()

    const activePanchayats = await Panchayat.find({ status: { $ne: 'rejected' } }).select('_id')
    const activePanchayatIds = activePanchayats.map(p => p._id)

    const [open, inProgress, resolved, allTickets] = await Promise.all([
      Ticket.countDocuments({ status: 'Open', panchayat: { $in: activePanchayatIds } }),
      Ticket.countDocuments({ status: 'In Progress', panchayat: { $in: activePanchayatIds } }),
      Ticket.countDocuments({ status: 'Resolved', panchayat: { $in: activePanchayatIds } }),
      Ticket.find({ panchayat: { $in: activePanchayatIds } })
        .populate('panchayat', 'name status')
        .sort({ createdAt: -1 })
    ])

    const formattedTickets = allTickets
      .filter(t => t.panchayat && t.panchayat.status !== 'rejected')
      .map(t => ({
        id: t._id,
        ticketId: t.ticketId,
        panchayatName: t.panchayat?.name || 'Unknown Panchayat',
        issueType: t.issueType || 'General Inquiry',
        createdDate: new Date(t.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        status: t.status || 'Open',
        description: t.description || ''
      }))

    res.status(200).json({
      stats: {
        open,
        inProgress,
        resolved
      },
      tickets: formattedTickets
    })
  } catch (error) {
    console.error('getCompanyTickets error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * Create Ticket
 */
export const createTicket = async (req, res) => {
  try {
    const { panchayatId, issueType, description } = req.body

    const count = await Ticket.countDocuments()
    const ticketId = `T-${(count + 1).toString().padStart(2, '0')}`

    const ticket = await Ticket.create({
      ticketId,
      panchayat: panchayatId,
      issueType: issueType || 'General Inquiry',
      description: description || '',
      status: 'Open'
    })

    res.status(201).json(ticket)
  } catch (error) {
    console.error('createTicket error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * Update Ticket Status
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, description } = req.body

    const updateData = {}
    if (status) updateData.status = status
    if (description !== undefined) updateData.description = description

    const ticket = await Ticket.findByIdAndUpdate(id, updateData, { new: true })
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' })
    }

    res.status(200).json(ticket)
  } catch (error) {
    console.error('updateTicketStatus error:', error)
    res.status(500).json({ message: error.message })
  }
}
