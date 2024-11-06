import { Router } from 'express'
import rateLimit from '../middlewares/rateLimit.js'
import advertismentController from '../controllers/advertismentController.js'
import { isAuthenticated } from '../middlewares/authMiddleware.js'

const router = Router()

router.route('/add-banner').post(rateLimit, isAuthenticated, advertismentController.addOrUpdateBanner)
router.route('/delete-banner').delete(rateLimit, isAuthenticated, advertismentController.deleteBanner)
router.route('/get-banner').get(rateLimit, advertismentController.getBanners)

export default router
