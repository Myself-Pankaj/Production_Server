import { Router } from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { allCabsAdmin, allDriversAdmin, allUserAdmin, getAvailableCabs } from '../controllers/adminController.js';

const router = Router();

router.route('/adminCabs').get(isAuthenticated, allCabsAdmin);

router.route('/adminUsers').get(isAuthenticated, allUserAdmin);

router.route('/adminDrivers').get(isAuthenticated, allDriversAdmin);

router.route('/adminFreeCabs').post(isAuthenticated, getAvailableCabs);

export default router;
