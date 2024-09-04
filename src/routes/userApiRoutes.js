import { Router } from 'express'
import {
    forgetPassword,
    getProfileById,
    login,
    logout,
    myProfile,
    register,
    resetPassword,
    updatePassword,
    updateProfile,
    verify
} from '../controllers/userApiController.js'
import { isAuthenticated } from '../middlewares/authMiddleware.js'

const router = Router()

router.route('/register').post(register)
router.route('/verify').post(isAuthenticated, verify)
router.route('/login').post(login)
router.route('/logout').get(isAuthenticated, logout)
router.route('/logout').get(isAuthenticated, logout)
router.route('/modify').put(isAuthenticated, updateProfile)
router.route('/modify/password').put(isAuthenticated, updatePassword)
router.route('/forgetpassword').post(forgetPassword)

router.route('/resetpassword').put(resetPassword)
router.route('/me').get(isAuthenticated, myProfile)

router.route('/userById/:id').get(isAuthenticated, getProfileById)

export default router
