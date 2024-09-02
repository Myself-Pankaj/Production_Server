import { Router } from 'express'
import apiController from '../controllers/apiContoller.js'

const router = Router()

router.route('/self').get(apiController.self)

export default router
