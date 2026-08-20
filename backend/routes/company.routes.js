import express from 'express'
import { getCompanyDashboard } from '../controllers/company.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Ideally protect this with SUPER_ADMIN role
router.get('/dashboard', getCompanyDashboard)

export default router
