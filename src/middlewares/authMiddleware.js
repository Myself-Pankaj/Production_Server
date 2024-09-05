// @ts-nocheck
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import httpResponse from '../utils/httpResponse.js'
import responseMessage from '../constants/responseMessage.js'
import { User } from '../models/userModel.js'
import httpError from '../utils/httpError.js'

export const isAuthenticated = async (req, res, next) => {
    try {
        // Use Authorization header instead of cookies for token
        const { token } = req.cookies
        if (!token) {
            //   return res.status(401).json({ success: false, message: "No token provided" });
            return httpResponse(req, res, 401, responseMessage.ACCOUNT_NOT_FOUND, null, null)
        }

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET)

            if (!decoded || !decoded._id) {
                // return res.status(401).json({ success: false, message: "Invalid token" });
                return httpResponse(req, res, 401, responseMessage.INVALID_TOKEN, null, null)
            }

            const user = await User.findById(decoded._id).select('-password')
            if (!user) {
                // return res.status(401).json({ success: false, message: "User not found" });
                return httpResponse(req, res, 401, responseMessage.USER_NOT_FOUND, null, null)
            }

            req.user = user
            next()
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return httpResponse(req, res, 401, responseMessage.TOKEN_EXPIRED, null, null)
            }
            if (err instanceof jwt.JsonWebTokenError) {
                return httpResponse(req, res, 401, responseMessage.INVALID_TOKEN, null, null)
            }
            throw err
        }
    } catch (error) {
        httpError(next, error, req, 500)
    }
}
