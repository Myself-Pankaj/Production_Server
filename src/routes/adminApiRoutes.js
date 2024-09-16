import { Router } from 'express'
import { isAuthenticated } from '../middlewares/authMiddleware.js'
import {
    adminStats,
    allAssignBookingAdmin,
    allCabsAdmin,
    allDriversAdmin,
    allOrdersAdmin,
    allPaymentInfo,
    allUnverifiedDriver,
    allUserAdmin,
    assignBooking,
    getAvailableCabs,
    getDriverInfoById,
    verifyDriver
} from '../controllers/adminController.js'

const router = Router()

router.route('/adminCabs').get(isAuthenticated, allCabsAdmin)

router.route('/adminUsers').get(isAuthenticated, allUserAdmin)

router.route('/adminDrivers').get(isAuthenticated, allDriversAdmin)

router.route('/adminOrders').get(isAuthenticated, allOrdersAdmin)

router.route('/adminUnverifiedDriver').get(isAuthenticated, allUnverifiedDriver)

router.route('/adminAssignBooking').get(isAuthenticated, allAssignBookingAdmin)

router.route('/adminFreeCabs').post(isAuthenticated, getAvailableCabs)

router.route('/assignBooking/:id').patch(isAuthenticated, assignBooking)

router.route('/driverInfo/:id').get(isAuthenticated, getDriverInfoById)

router.route('/verifyDriver/:id').put(isAuthenticated, verifyDriver)

router.route('/allPendingPayment').get(isAuthenticated, allPaymentInfo)

router.route('/adminStats').get(isAuthenticated, adminStats)

export default router
