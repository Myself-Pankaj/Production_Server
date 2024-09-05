import httpResponse from '../utils/httpResponse.js'
import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'
import { User } from '../models/userModel.js'
import config from '../config/config.js'
import { generateNumericOTP } from '../utils/otherUtils.js'
import emails from '../constants/emails.js'
import { sendMailWithRetry } from '../services/emailServices.js'
import logger from '../utils/logger.js'
import { sendToken } from '../services/tokenServices.js'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'
import CustomError from '../utils/customeError.js'

export const register = async (req, res, next) => {
    try {
        const { username, email, password, phoneNumber, role } = req.body
        // Check if user already exists
        let existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] })

        if (existingUser) {
            throw new CustomError(responseMessage.USER_ALREADY_EXIST, 409)
        }

        // Generate OTP
        const otp = generateNumericOTP(config.OTP_LENGTH)
        const otpExpireMinutes = parseInt(config.OTP_EXPIRE, 10)
        if (isNaN(otpExpireMinutes)) {
            throw new CustomError('Error in genrating otp', 500)
        }
        const otpExpiryDate = new Date(Date.now() + otpExpireMinutes * 60 * 1000)

        let user
        // Create user
        user = await User.create({
            username,
            email,
            password,
            phoneNumber,
            role,
            otp,
            otp_attempt: 0,
            otp_expiry: otpExpiryDate
        })
        // Send verification email

        try {
            await sendMailWithRetry(
                email,
                responseMessage.ACCOUNT_VERIFICATION_EMAIL_SUBJECT,
                emails.REGISTRATION_EMAIL(username, otp),
                responseMessage.ACCOUNT_VERIFICATION_EMAIL_CLOSURE
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SEND_FAIL(email), emailError)

            return httpResponse(req, res, 503, responseMessage.EMAIL_SEND_FAIL(email))
        }
        // Clear cache if needed
        // Cachestorage.del(['all_user', 'all_drivers']);

        // Send response with token
        sendToken(req, res, user, 201, responseMessage.ACCOUNT_VERIFICATION)
    } catch (error) {
        // Log other errors
        logger.error(responseMessage.USER_REGISTRATION_FAIL, error)
        return httpError(next, error, req, 500)
    }
}

const MAX_OTP_ATTEMPTS = 5

export const verify = async (req, res, next) => {
    try {
        const { otp } = req.body
        // Input validation

        const numericOTP = Number(otp)

        const user = await User.findById(req.user._id)
        if (!user) {
            // return httpResponse(req, res, 404, responseMessage.USER_NOT_FOUND, null, null)
            throw new CustomError(responseMessage.USER_NOT_FOUND, 404)
        }
        // Check if user is already verified
        if (user.isVerified) {
            throw new CustomError(responseMessage.ALREADY_VERIFIED, 409)
        }
        // Check if user has exceeded maximum attempts
        if (user.otp_attempt >= MAX_OTP_ATTEMPTS) {
            throw new CustomError(responseMessage.MAX_OTP_ATTEMPTS_EXCEEDED, 429)
        }
        // OTP validation
        if (user.otp !== numericOTP) {
            user.otp_attempt += 1
            await user.save()
            if (user.otp_attempt >= MAX_OTP_ATTEMPTS) {
                throw new CustomError(responseMessage.MAX_OTP_ATTEMPTS_EXCEEDED, 429)
            }
            throw new CustomError(responseMessage.INVALID_OTP(MAX_OTP_ATTEMPTS - user.otp_attempt), 400)
        }
        // OTP expiration check
        if (user.otp_expiry < Date.now()) {
            throw new CustomError(responseMessage.OTP_EXPIRED, 400)
        }
        // Update user
        user.isVerified = true
        user.otp = null
        user.otp_expiry = null
        user.otp_attempt = 0 // Reset attempts on successful verification
        await user.save()
        // Send email notification
        try {
            await sendMailWithRetry(
                user.email,
                responseMessage.ACCOUNT_VERIFICATION_SUCCESS_EMAIL_SUBJECT(user.username),
                emails.VERIFICATION_SUCCESS_EMAIL(user.username)
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SEND_FAIL(user.email), { error: emailError })
            // Note: We're continuing even if email fails, as the verification was successful
        }
        // Send token and success response
        sendToken(req, res, user, 200, responseMessage.ACCOUNT_VERIFICATION_SUCCESS)
    } catch (error) {
        logger.error(responseMessage.ACCOUNT_VERIFICATION_FAIL, { meta: { error: error } })
        httpError(next, error, req, 500)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            throw new CustomError(responseMessage.INVALID_FORMAT, 400)
        }

        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            throw new CustomError(responseMessage.INVALID_LOGIN, 401)
        }

        const isMatch = await user.verifyPassword(password)

        if (!isMatch) {
            throw new CustomError(responseMessage.INVALID_LOGIN, 401)
        }

        sendToken(req, res, user, 201, responseMessage.LOGIN_SUCCESS)
    } catch (error) {
        logger.error(responseMessage.LOGIN_FAIL, { meta: { error: error } })
        httpError(next, error, req, 500)
    }
}

export const logout = async (req, res, next) => {
    try {
        // Clear the authentication token and other related cookies
        res.cookie('token', '', {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: config.ENV === 'production', // Use secure cookies in production
            sameSite: 'strict' // Protect against CSRF attacks
        })
            .cookie('deletionToken', '', {
                expires: new Date(Date.now()),
                httpOnly: true,
                secure: config.ENV === 'production',
                sameSite: 'strict'
            })
            .clearCookie('auth_error') // Clear the error cookie if it exists

        // Send success response
        httpResponse(req, res, 201, responseMessage.LOGOUT_SUCCESS, null, null)

        // Log the successful logout
        logger.info(`${req.user.username}  ${req.user._id} ${responseMessage.LOGOUT_SUCCESS}`)
    } catch (error) {
        logger.error(responseMessage.LOGOUT_FAIL, {
            meta: error
        })

        // Use httpError utility to handle the error consistently
        httpError(next, error, req, 500)
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            throw new CustomError(responseMessage.USER_NOT_FOUND, 400)
        }
        const { name, phoneNumber } = req.body

        if (name) {
            user.username = name
        }
        if (phoneNumber) {
            user.phoneNumber = phoneNumber
        }

        if (req.files && req.files.avatar) {
            const avatar = req.files.avatar

            // Delete old avatar from cloudinary if it exists
            if (user.avatar && user.avatar.public_id) {
                await cloudinary.v2.uploader.destroy(user.avatar.public_id)
            }

            // Upload new avatar
            const myCloud = await cloudinary.v2.uploader.upload(avatar.tempFilePath, {
                folder: 'TandT',
                resource_type: 'image'
            })

            // Remove temporary file
            fs.unlinkSync(avatar.tempFilePath)

            user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        // Cachestorage.del(['all_user','all_drivers']);

        await user.save()

        httpResponse(req, res, 201, responseMessage.PROFILE_UPDATE_SUCCESS, user, null)
    } catch (error) {
        logger.error(responseMessage.PROFILE_UPDATE_FAIL, { meta: { error: error } })
        httpError(next, error, req, 500)
    }
}

export const updatePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            // return res
            //   .status(400)
            //   .json({ success: false, message: "Please enter all fields" });
            throw new CustomError(responseMessage.INVALID_FORMAT, 400)
        }

        const user = await User.findById(req.user._id).select('+password')
        if (!user) {
            throw new CustomError(responseMessage.USER_NOT_FOUND, 400)
        }

        const isMatch = await user.verifyPassword(oldPassword)

        if (!isMatch) {
            throw new CustomError(responseMessage.PASSWORD_NOT_MATCHING, 400)
        }

        user.password = newPassword
        await user.save()
        // Send email notification
        try {
            await sendMailWithRetry(
                user.email,
                responseMessage.PASSWORD_CHANGE_EMAIL_SUBJECT,
                emails.PASSWORD_UPDATE_SUCCESS_EMAIL(user.username),
                `Congratulations ${user.username}! Your account has been successfully verified.`
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SEND_FAIL(user.email), { error: emailError })
            // Note: We're continuing even if email fails, as the verification was successful
        }
        httpResponse(req, res, 201, responseMessage.PASSWORD_UPDATE_SUCCESS)
    } catch (error) {
        logger.error(responseMessage.PASSWORD_RESET_FAIL, { meta: { error: error } })
        httpError(next, error, req, 500)
    }
}

export const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            throw new CustomError(responseMessage.INVALID_EMAIL, 404)
        }

        // Generate a random OTP
        const otp = generateNumericOTP(config.OTP_LENGTH)
        const otpExpireMinutes = parseInt(config.OTP_EXPIRE, 10)
        if (isNaN(otpExpireMinutes)) {
            throw new CustomError('Error Genrating OTP', 500)
        }

        // Set the OTP and its expiry in the user document
        user.resetPasswordOtp = otp

        user.resetPasswordOtpExpiry = new Date(Date.now() + otpExpireMinutes * 60 * 1000)

        // Save the user document
        await user.save()

        // Send the email containing the OTP
        try {
            await sendMailWithRetry(
                user.email,
                responseMessage.FORGET_PASSWORD_EMAIL_SUBJECT,
                emails.FORGOT_PASSWORD_EMAIL(user.username, otp),
                responseMessage.EMAIL_CLOSURE
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SEND_FAIL(user.email), { meta: { error: emailError } })

            return httpResponse(req, res, 503, responseMessage.EMAIL_SEND_FAIL(email))
        }
        httpResponse(req, res, 200, responseMessage.EMAIL_SEND_SUCCESS(user.email))
    } catch (error) {
        logger.error(responseMessage.FORGET_PASSWORD_FAIL, { meta: { error: error } })
        httpError(next, error, req, 500)
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { otp, newPassword } = req.body

        const user = await User.findOne({
            resetPasswordOtp: otp,
            resetPasswordOtpExpiry: { $gt: Date.now() }
        })

        if (!user) {
            throw new CustomError(responseMessage.INVALID_OTP_FORMAT, 400)
        }

        // Set the new password and clear the OTP and its expiry
        user.password = newPassword
        user.resetPasswordOtp = null
        user.resetPasswordOtpExpiry = null

        // Save the updated user document
        await user.save()

        // Send email notification for successful password reset
        try {
            await sendMailWithRetry(
                user.email,
                responseMessage.PASSWORD_RESET_SUCCESS_EMAIL_SUBJECT(user.username),
                emails.PASSWORD_UPDATE_SUCCESS_EMAIL(user.username)
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SEND_FAIL(user.email), { meta: { error: emailError } })
            // Note: We're continuing even if email fails, as the verification was successful
        }

        httpResponse(req, res, 201, responseMessage.PASSWORD_RESET_SUCCESS, user, null)
    } catch (error) {
        logger.error(responseMessage.PASSWORD_RESET_FAIL, { meta: { error: error } })
        httpError(next, error, req, 500)
    }
}
export const getProfileById = async (req, res, next) => {
    try {
        // Extracting ID from request body
        const { id } = req.params

        // Ensure the ID is provided
        if (!id) {
            throw new CustomError(responseMessage.INVALID_FORMAT, 400)
        }

        const user = await User.findById(id)

        if (!user) {
            // Handle the case where no user is found
            throw new CustomError(responseMessage.USER_NOT_FOUND, 400)
        }
        httpResponse(req, res, 200, responseMessage.SUCCESS, user, null)
        //   res.status(200).json({ success: true, user });
    } catch (error) {
        // Catch any unexpected errors
        logger.error(responseMessage.USER_NOT_FOUND, { meta: { error: error } })
        httpError(next, error, req, 500)
    }
}

export const myProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            // Handle the case where no user is found
            throw new CustomError(responseMessage.USER_NOT_FOUND, 400)
        }
        httpResponse(req, res, 200, responseMessage.SUCCESS, user, null)
    } catch (error) {
        logger.error(responseMessage.USER_NOT_FOUND, { meta: { error: error } })
        httpError(next, error, req, 500)
    }
}
