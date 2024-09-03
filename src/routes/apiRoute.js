import { Router } from 'express'
import apiController from '../controllers/apiContoller.js'
import rateLimit from '../middlewares/rateLimit.js'

const router = Router()

router.route('/self').get(rateLimit, apiController.self)
router.route('/health').get(apiController.health)

export default router
