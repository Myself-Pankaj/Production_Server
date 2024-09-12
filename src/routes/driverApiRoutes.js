import { Router } from 'express'
import { isAuthenticated } from '../middlewares/authMiddleware.js'
import {
    cancelBooking,
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

router.route('/confirm-driver-booking').put(isAuthenticated, confirmBooking)

router.route('/cancel-driver-booking').put(isAuthenticated, cancelBooking)

export default router
