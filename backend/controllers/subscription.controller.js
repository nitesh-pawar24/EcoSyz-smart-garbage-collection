import Subscription from '../models/Subscription.model.js'
import Panchayat from '../models/Panchayat.model.js'
import Payment from '../models/Payment.model.js'

const PLAN_PRICES = {
  BASIC: 1499,
  STANDARD: 2699,
  PREMIUM: 5999,
}

const PLAN_CONFIG = {
  BASIC: {
    householdLimit: 100,
    labourLimit: 10,
    features: ['Household registration', 'Waste tracking', 'Email support'],
  },
  STANDARD: {
    householdLimit: 300,
    labourLimit: 30,
    features: ['Advanced analytics', 'Labour attendance', 'Complaints', 'Monthly reports'],
  },
  PREMIUM: {
    householdLimit: 500,
    labourLimit: 50,
    features: ['AI predictions', 'Route optimization', 'Priority support', 'Dedicated manager'],
  },
}

const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/* ===============================
   ACTIVATE (30 DAYS)
================================ */
export const createSubscription = async (req, res) => {
  try {
    const { panchayatId, planName } = req.body

    const planKey = planName?.toUpperCase()
    const plan = PLAN_CONFIG[planKey]

    if (!panchayatId || !plan) {
      return res.status(400).json({ message: 'Invalid data' })
    }

    const startDate = new Date()
    const endDate = addDays(startDate, 30)
    const graceEndDate = addDays(endDate, 7)

    let subscription = await Subscription.findOne({ panchayatId })

    if (subscription) {
      subscription.planName = planKey
      subscription.householdLimit = plan.householdLimit
      subscription.labourLimit = plan.labourLimit
      subscription.features = plan.features
      subscription.startDate = startDate
      subscription.endDate = endDate
      subscription.graceEndDate = graceEndDate

      await subscription.save()
    } else {
      subscription = await Subscription.create({
        panchayatId,
        planName: planKey,
        householdLimit: plan.householdLimit,
        labourLimit: plan.labourLimit,
        features: plan.features,
        startDate,
        endDate,
        graceEndDate,
      })
    }

    // 🔑 THIS WAS MISSING
    await Panchayat.findByIdAndUpdate(panchayatId, {
      subscriptionId: subscription._id,
    })

    // Record Payment
    try {
      const amount = PLAN_PRICES[planKey] || 2699
      const txId = `pay_${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`
      await Payment.create({
        panchayat: panchayatId,
        planName: planKey.charAt(0) + planKey.slice(1).toLowerCase(),
        amount,
        paymentDate: new Date(),
        transactionId: txId,
        status: 'Successful',
        paymentMethod: 'Online / NetBanking'
      })
    } catch (payErr) {
      console.error('Payment record creation error:', payErr)
    }

    res.status(201).json({
      message: 'Subscription activated',
      subscription,
    })
  } catch (err) {
    console.error('ACTIVATION ERROR:', err)
    res.status(500).json({ message: 'Activation failed' })
  }
}

/* ===============================
   LIST ALL (WITH NOT_ACTIVE)
================================ */
export const listAllSubscriptions = async (req, res) => {
  try {
    const panchayats = await Panchayat.find({ status: { $ne: 'rejected' } }).select('name')
    const subs = await Subscription.find()

    const map = new Map()
    subs.forEach((s) => map.set(s.panchayatId.toString(), s))

    const result = panchayats.map((p) => {
      const sub = map.get(p._id.toString())
      if (!sub) {
        return {
          panchayatId: p._id,
          panchayatName: p.name,
          planName: '-',
          endDate: null,
          status: 'NOT_ACTIVE',
        }
      }

      const now = new Date()
      let status = 'Active'
      if (now > sub.graceEndDate) status = 'Expired'
      else if (now > sub.endDate) status = 'Grace'

      return {
        subscriptionId: sub._id,
        panchayatId: p._id,
        panchayatName: p.name,
        planName: sub.planName,
        endDate: sub.endDate,
        status,
      }
    })

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Fetch failed' })
  }
}

/* ===============================
   REACTIVATE (30 DAYS RESET)
================================ */
export const reactivateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params
    const sub = await Subscription.findById(subscriptionId)

    if (!sub) {
      return res.status(404).json({ message: 'Not found' })
    }

    const startDate = new Date()
    sub.startDate = startDate
    sub.endDate = addDays(startDate, 30)
    sub.graceEndDate = addDays(sub.endDate, 7)

    await sub.save()

    // Record Payment
    try {
      const planKey = sub.planName?.toUpperCase() || 'STANDARD'
      const amount = PLAN_PRICES[planKey] || 2699
      const txId = `pay_${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`
      await Payment.create({
        panchayat: sub.panchayatId,
        planName: planKey.charAt(0) + planKey.slice(1).toLowerCase(),
        amount,
        paymentDate: new Date(),
        transactionId: txId,
        status: 'Successful',
        paymentMethod: 'Online / NetBanking'
      })
    } catch (payErr) {
      console.error('Payment record creation error:', payErr)
    }

    res.json({ message: 'Reactivated for 30 days', subscription: sub })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Reactivation failed' })
  }
}

/* ===============================
   CHANGE PLAN (30 DAYS RESET)
================================ */
export const upgradeSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params
    const planKey = req.body.planName?.toUpperCase()
    const plan = PLAN_CONFIG[planKey]

    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan' })
    }

    const sub = await Subscription.findById(subscriptionId)
    if (!sub) {
      return res.status(404).json({ message: 'Not found' })
    }

    const startDate = new Date()

    sub.planName = planKey
    sub.householdLimit = plan.householdLimit
    sub.labourLimit = plan.labourLimit
    sub.features = plan.features
    sub.startDate = startDate
    sub.endDate = addDays(startDate, 30)
    sub.graceEndDate = addDays(sub.endDate, 7)

    await sub.save()

    // Record Payment
    try {
      const amount = PLAN_PRICES[planKey] || 2699
      const txId = `pay_${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`
      await Payment.create({
        panchayat: sub.panchayatId,
        planName: planKey.charAt(0) + planKey.slice(1).toLowerCase(),
        amount,
        paymentDate: new Date(),
        transactionId: txId,
        status: 'Successful',
        paymentMethod: 'Online / NetBanking'
      })
    } catch (payErr) {
      console.error('Payment record creation error:', payErr)
    }

    res.json({ message: `Plan changed to ${planKey}`, subscription: sub })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Plan change failed' })
  }
}
