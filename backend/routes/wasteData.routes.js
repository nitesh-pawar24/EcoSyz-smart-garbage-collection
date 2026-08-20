import express from 'express'
import { createWasteData, getAllWasteData, deleteWasteData, getWasteStats, updateWasteData } from '../controllers/wasteData.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(protect)

router.get('/stats', getWasteStats)
router.post('/', createWasteData)
router.get('/', getAllWasteData)
router.delete('/:id', deleteWasteData)
router.put('/:id', updateWasteData)

export default router
