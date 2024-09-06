import { Router } from 'express'
import { isAuthenticated } from '../middlewares/authMiddleware.js'
import { driverVerification } from '../controllers/driverApiController.js'

const router = Router()

router.route('/docVerification').put(isAuthenticated, driverVerification)

export default router
