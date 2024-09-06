import { Router } from 'express'
import { isAuthenticated } from '../middlewares/authMiddleware.js'
import { bookCab, getAllPendingOrder, getMyBookings, getOrderDetail, paymentVerification } from '../controllers/orderController.js'

const router = Router()

router.route('/placeOrder').post(isAuthenticated, bookCab)

router.route('/paymentVerification').post(isAuthenticated, paymentVerification)

router.route('/myBooking').get(isAuthenticated, getMyBookings)

router.route('/myBooking/:id').get(isAuthenticated, getOrderDetail)

router.route('/pendingOrders').get(isAuthenticated, getAllPendingOrder)

export default router
