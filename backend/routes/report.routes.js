import express from 'express';
import { generateReport } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/generate', generateReport); // Add protect middleware later if needed

export default router;
