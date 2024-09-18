import { createHash } from 'crypto'
import logger from '../utils/logger.js'
import config from '../config/config.js'
import httpResponse from '../utils/httpResponse.js'
import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'

export const sendToken = (req, res, user, statusCode, message, deletionToken = null) => {
    try {
        const token = user.getJWTToken()

        const cookieOptions = {
            httpOnly: true,
            secure: config.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Protect against CSRF attacks
            expires: new Date(Date.now() + parseInt(config.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000) //* 24 * 60 * 60 * 1000
        }

        // Hash sensitive data before sending
        const hashedId = createHash('sha256').update(user._id.toString()).digest('hex')

        const phoneNumberLastFour = user.phoneNumber
            ? user.phoneNumber.toString().slice(-4) // Convert to string and get last 4 digits
            : null

        const userData = {
            _id: hashedId,
            name: user.username,
            email: user.email,
            avatar: user.avatar,
            phoneNo: phoneNumberLastFour,
            role: user.role,
            verified: user.isVerified,
            documented: user.isDocumentSubmited,
            driver: user.isVerifiedDriver,
            haveCab: user.haveCab
        }

        // Set the token cookie
        res.cookie('token', token, cookieOptions)

        // Set deletionToken cookie if provided
        if (deletionToken) {
            res.cookie('deletionToken', deletionToken, { ...cookieOptions, httpOnly: false })
        }

        // Clear any existing error cookies
        res.clearCookie('auth_error')

        // Use sendResponse to send the response
        httpResponse(req, res, statusCode, message, userData, token)

        logger.info(responseMessage.TOKEN_CREATED_SUCCESS(userData.name))
    } catch (error) {
        logger.error('Error in sendToken:', {
            meta: error
        })

        // Set an error cookie
        res.cookie('auth_error', 'An error occurred during authentication', {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000 // 5 minutes
        })
        const handleError = (errorObj) => {
            res.status(errorObj.statusCode).json(errorObj) // Send the error response
        }
        httpError('TOKEN ERROR', handleError, error, req, res, 500)
    }
}
