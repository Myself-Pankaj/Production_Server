import { Router } from 'express'
import apiController from '../controllers/apiContoller.js'
import rateLimit from '../middlewares/rateLimit.js'

const router = Router()

router.route('/self').get(rateLimit, apiController.self)
router.route('/health').get(apiController.health)
router.route('/distance').get(apiController.calculateDistance)

export default router
