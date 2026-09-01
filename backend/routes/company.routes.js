import express from 'express'
import {
  getCompanyDashboard,
  getCompanyPayments,
  createPayment,
  getCompanyTickets,
  createTicket,
  updateTicketStatus
} from '../controllers/company.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Dashboard metrics
router.get('/dashboard', getCompanyDashboard)

// Payments
router.get('/payments', getCompanyPayments)
router.post('/payments', createPayment)

// Support Tickets
router.get('/tickets', getCompanyTickets)
router.post('/tickets', createTicket)
router.patch('/tickets/:id', updateTicketStatus)

export default router
