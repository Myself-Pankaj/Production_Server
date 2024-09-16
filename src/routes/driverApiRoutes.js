import { Router } from 'express'
import { isAuthenticated } from '../middlewares/authMiddleware.js'
import {
    cancelBooking,
    completeBooking,
    confirmBooking,
    driverVerification,
    getDriverAllBookings,
    getDriverUpcommingBookings
} from '../controllers/driverApiController.js'

const router = Router()

router.route('/docVerification').put(isAuthenticated, driverVerification)

router.route('/getDriverUpcomingBookings').get(isAuthenticated, getDriverUpcommingBookings)

router.route('/getDriverAllBookings').get(isAuthenticated, getDriverAllBookings)

router.route('/confirm-driver-booking').put(isAuthenticated, confirmBooking)

router.route('/cancel-driver-booking').put(isAuthenticated, cancelBooking)

router.route('/complete-driver-booking').put(isAuthenticated, completeBooking)

export default router
