// @ts-nocheck
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import httpResponse from '../utils/httpResponse.js'
import responseMessage from '../constants/responseMessage.js'
import { User } from '../models/userModel.js'
import httpError from '../utils/httpError.js'
import CustomError from '../utils/customeError.js'

// export const isAuthenticated = async (req, res, next) => {
//     try {
//         // Use Authorization header instead of cookies for token
//         const { token } = req.cookies
//         if (!token) {
//             //   return res.status(401).json({ success: false, message: "No token provided" });
//             return httpResponse(req, res, 401, responseMessage.ACCOUNT_NOT_FOUND, null, null)
//             // throw new CustomError(responseMessage.ACCOUNT_NOT_FOUND,401)
//         }

//         try {
//             const decoded = jwt.verify(token, config.JWT_SECRET)

//             if (!decoded || !decoded._id) {
//                 // return res.status(401).json({ success: false, message: "Invalid token" });
//                 return httpResponse(req, res, 401, responseMessage.INVALID_TOKEN, null, null)
//                 // throw new CustomError(responseMessage.INVALID_TOKEN,401)
//             }

//             const user = await User.findById(decoded._id).select('-password')
//             if (!user) {
//                 // return res.status(401).json({ success: false, message: "User not found" });
//                 return httpResponse(req, res, 401, responseMessage.USER_NOT_FOUND, null, null)
//                 // throw new CustomError(responseMessage.USER_NOT_FOUND,401)
//             }

//             req.user = user
//             next()
//         } catch (err) {
//             if (err instanceof jwt.TokenExpiredError) {
//                 return httpResponse(req, res, 401, responseMessage.TOKEN_EXPIRED, null, null)
//                 // httpError('Authentication',next,err,req,500)
//             }
//             if (err instanceof jwt.JsonWebTokenError) {
//                 return httpResponse(req, res, 401, responseMessage.INVALID_TOKEN, null, null)

//             }
//             throw err
//         }
//     } catch (error) {
//         httpError('Auth',next, error, req, 500)
//     }
// }
export const isAuthenticated = async (req, res, next) => {
    try {
        // Extract token from cookies
        const { token } = req.cookies

        if (!token) {
            // Handle missing token case
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Login First ! Account'), 401)
        }

        // Verify the token
        const decoded = jwt.verify(token, config.JWT_SECRET)

        if (!decoded || !decoded._id) {
            // Handle invalid token case
            throw new CustomError(responseMessage.TOKEN_INVALID, 401)
        }

        // Fetch user from the decoded token
        const user = await User.findById(decoded._id).select('-password')
        if (!user) {
            // Handle user not found
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('User'), 401)
        }

        // Attach user to request object
        req.user = user
        next()
    } catch (err) {
        // Handle token expiration error
        if (err instanceof jwt.TokenExpiredError) {
            return httpResponse(req, res, 401, responseMessage.TOKEN_EXPIRED, null, null)
        }

        // Handle invalid JWT error
        if (err instanceof jwt.JsonWebTokenError) {
            return httpResponse(req, res, 401, responseMessage.TOKEN_INVALID, null, null)
        }

        // General error handling
        httpError('Authentication Error', next, err, req, 500)
    }
}
