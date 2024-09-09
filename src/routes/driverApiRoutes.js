import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { driverVerification, getDriverCompletedBookings } from '../controllers/driverApiController.js';

const router = Router();

router.route('/docVerification').put(isAuthenticated, driverVerification);

// router.route('/getDriverUpcomingBookings').get(isAuthenticated, getDriverUpcomingBookings)

router.route('/getDriverCompletedBookings').get(isAuthenticated, getDriverCompletedBookings);

export default router;
