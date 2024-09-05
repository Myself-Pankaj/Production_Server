import { Router } from 'express'

import { isAuthenticated } from '../middlewares/authMiddleware.js'
import { deleteCab, getDriverOwnedCabs, getRateDefinedCab, getSingleCabs, registerCab, updateCab } from '../controllers/cabApiController.js'

const router = Router()

router.route('/cab-register').post(isAuthenticated, registerCab)

router.route('/updateCab/:id').put(isAuthenticated, updateCab)

router.route('/getRateDefinedCabs').get(isAuthenticated, getRateDefinedCab)

router.route('/getSingleCabs/:id').get(isAuthenticated, getSingleCabs)

router.route('/getDriverOwnedCabs').get(isAuthenticated, getDriverOwnedCabs)

router.route('/deleteCab/:id').delete(isAuthenticated, deleteCab)

export default router
