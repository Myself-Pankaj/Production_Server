import responseMessage from '../constants/responseMessage.js'
import { User } from '../models/userModel.js'
import { delCache, flushCache } from '../services/cacheService.js'
import httpResponse from '../utils/httpResponse.js'
import fs from 'fs'
import logger from '../utils/logger.js'
import CustomError from '../utils/customeError.js'
import cloudinary from '../config/cloudinary.js'
import httpError from '../utils/httpError.js'
import mongoose, { startSession } from 'mongoose'
import { Cab } from '../models/cabModel.js'
import { Order } from '../models/orderModel.js'
import { sendMailWithRetry } from '../services/emailServices.js'
import emails from '../constants/emails.js'

export const driverVerification = async (req, res, next) => {
    const tmpDir = './tmp'
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        delCache(['all_user', 'all_drivers'])

        if (req.user.role !== 'Driver') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        const user = await User.findById(req.user._id).session(session)
        if (!user) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('User'), 404)
        }

        await fs.promises.mkdir(tmpDir, { recursive: true }).catch((error) => {
            logger.error(`Failed to create temp directory:`, { meta: { error } })
            throw new CustomError('Failed to create temp directory', 500)
        })

        if (!req.files || !req.files.document) {
            throw new CustomError(responseMessage.INVALID_DOCUMENT_FORMAT, 400)
        }

        const documents = Array.isArray(req.files.document) ? req.files.document : [req.files.document]
        const docNames = Array.isArray(req.body['docName[]']) ? req.body['docName[]'] : [req.body['docName[]']]

        const allowedFormats = ['image/jpeg', 'image/png', 'application/pdf']
        documents.forEach((doc) => {
            if (!allowedFormats.includes(doc.mimetype)) {
                throw new CustomError(responseMessage.INVALID_DOCUMENT_FORMAT, 400)
            }
            if (doc.size > 2 * 1024 * 1024) {
                throw new CustomError(responseMessage.DOCUMENT_TOO_LARGE, 400)
            }
        })

        const uploadedDocuments = await Promise.all(
            documents.map(async (doc, index) => {
                try {
                    const uploadResult = await cloudinary.v2.uploader.upload(doc.tempFilePath, {
                        folder: 'TandT/DriverDocuments',
                        resource_type: 'auto'
                    })
                    fs.unlinkSync(doc.tempFilePath)

                    return {
                        docName: docNames[index] || `Document ${index + 1}`,
                        public_id: uploadResult.public_id,
                        url: uploadResult.secure_url,
                        uploadedAt: new Date()
                    }
                } catch (uploadError) {
                    logger.error(`Document upload failed: ${doc.name}`, { meta: { error: uploadError } })
                    throw new CustomError(responseMessage.DOCUMENT_UPLOAD_FAILURE, 500)
                }
            })
        )

        user.driverDocuments.push(...uploadedDocuments)
        user.isDocumentSubmited = true

        const accNo = req.body['bankDetails[accNo]']
        const accountHolderName = req.body['bankDetails[accountHolderName]']
        const ifsc = req.body['bankDetails[ifsc]']
        const bankName = req.body['bankDetails[bankName]']

        if (!accNo || !ifsc || !bankName || !accountHolderName) {
            throw new CustomError(responseMessage.MISSING_BANK_DETAILS, 400)
        }

        if (!/^\d+$/.test(accNo) || !/^[A-Za-z]{4}[0-9]{7}$/.test(ifsc)) {
            throw new CustomError(responseMessage.INVALID_BANK_DETAILS, 400)
        }

        user.wallet = user.wallet || {}
        user.wallet.bankDetails = {
            accountHolderName: accountHolderName,
            accNo: parseInt(accNo, 10), // Convert to Number as per schema
            ifsc: ifsc,
            bankName: bankName
        }

        // If the user doesn't have a wallet, initialize it
        if (!user.wallet.balance) {
            user.wallet.balance = 0
        }
        if (!user.wallet.currency) {
            user.wallet.currency = 'INR'
        }
        await user.save({ session })

        await session.commitTransaction()

        return httpResponse(req, res, 200, responseMessage.DOCUMENT_UPLOAD_SUCCESS, uploadedDocuments, null)
    } catch (error) {
        await session.abortTransaction()
        httpError('DOCUMENT VERIFICATION', next, error, req, 500)
    } finally {
        session.endSession()

        if (fs.existsSync(tmpDir)) {
            await fs.promises.rm(tmpDir, { recursive: true })
        }
    }
}

export const getDriverUpcommingBookings = async (req, res, next) => {
    try {
        // Ensure the user is authorized
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        const driverId = req.user._id

        // Find the cabs that belong to the driver
        const driverCabs = await Cab.find({ belongsTo: driverId })
            .populate({
                path: 'upcomingBookings',
                populate: {
                    path: 'orderId',
                    select: 'bookingType pickupLocation exactLocation destination',
                    populate: {
                        path: 'userId',
                        select: 'username email phoneNumber'
                    }
                }
            })
            .select('_id upcomingBookings')

        // Arrays to hold filtered bookings
        let acceptedBookings = []
        let unacceptedBookings = []

        driverCabs.forEach((cab) => {
            const { upcomingBookings } = cab
            if (upcomingBookings && upcomingBookings.length > 0) {
                upcomingBookings.forEach((booking) => {
                    const bookingObject = {
                        cabId: cab._id,
                        ...booking.toObject() // Convert Mongoose document to plain object
                    }
                    if (booking.accepted) {
                        acceptedBookings.push(bookingObject)
                    } else {
                        unacceptedBookings.push(bookingObject)
                    }
                })
            }
        })

        // Check if there are any bookings to return
        if (acceptedBookings.length === 0 && unacceptedBookings.length === 0) {
            return httpResponse(req, res, 404, responseMessage.RESOURCE_NOT_FOUND('Cab'), null, null)
        }

        // Return both accepted and unaccepted bookings
        return httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, { acceptedBookings, unacceptedBookings }, null)
    } catch (error) {
        return httpError('getDriverUpcomingBookings', next, error, req, 500)
    }
}

export const getDriverAllBookings = async (req, res, next) => {
    try {
        // Check user role
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Pagination setup
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5

        // Validation for pagination
        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400)
        }

        const skip = (page - 1) * limit
        const userId = req.user._id

        // Fetch driver orders
        const driverOrders = await Order.find({ driverId: userId, bookingStatus: 'Completed' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

        // If no orders found
        if (!driverOrders || driverOrders.length === 0) {
            return httpResponse(req, res, 404, responseMessage.RESOURCE_NOT_FOUND('No orders found for this driver'), null, null, null)
        }

        // Count total orders for pagination
        const totalDriverOrders = await Order.countDocuments({ driverId: userId })

        // Pagination info
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalDriverOrders / limit),
            totalItems: totalDriverOrders
        }

        // Successful response with orders and pagination info
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, driverOrders, null, pagination)
    } catch (error) {
        httpError('GET ALL DRIVER BOOKING', next, error, req, 500)
    }
}

export const confirmBooking = async (req, res, next) => {
    const session = await startSession()
    session.startTransaction()
    try {
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        const { orderId } = req.body

        if (!orderId) {
            throw new CustomError('Order ID is required to confirm the booking', 400)
        }

        const order = await Order.findByIdAndUpdate(orderId, { bookingStatus: 'Confirmed' }, { new: true, runValidators: true }).populate({
            path: 'userId',
            select: 'username email phoneNumber'
        })

        if (!order) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Order'), 404)
        }

        const cab = await Cab.findOne({ 'upcomingBookings.orderId': orderId })
        if (!cab) {
            throw new CustomError('Cab with this booking not found', 404)
        }
        const bookingIndex = cab.upcomingBookings.findIndex((booking) => booking.orderId.toString() === orderId)
        if (bookingIndex === -1) {
            throw new CustomError(`Booking not found in cab's upcoming bookings`, 404)
        }
        cab.upcomingBookings[bookingIndex].accepted = true
        await cab.save()
        //send an email to your
        try {
            await sendMailWithRetry(
                order.userId.email,
                responseMessage.BOOKING_CONFIRMED_EMAIL_SUBJECT,
                emails.BOOKING_CONFIRMED_EMAIL(order.userId.username)
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SENDING_FAILED(order.userId.email), { error: emailError })
            // Continue even if email fails, but log the error
        }
        // await delCache(['pending_orders', 'all_bookings'])
        flushCache()

        await session.commitTransaction()
        session.endSession()
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, null, null, null)
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        httpError('CONFIRM BOOKING', next, error, req, 500)
    }
}

export const cancelBooking = async (req, res, next) => {
    const maxRetries = 3

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
                throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
            }

            const { orderId } = req.body

            if (!orderId) {
                throw new CustomError('Order ID is required to cancel the booking', 400)
            }

            // Find the order
            const order = await Order.findById(orderId).session(session)
            if (!order) {
                throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Order'), 404)
            }

            // Find the cab associated with the order and remove the booking
            if (order.bookedCab) {
                const cab = await Cab.findById(order.bookedCab).session(session)
                if (!cab) {
                    throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
                }
                cab.removeBooking(orderId)
                await cab.save({ session })
            }

            // Update the order status and remove all driver-related information
            const updateResult = await Order.updateOne(
                { _id: orderId },
                {
                    $set: {
                        bookingStatus: 'Pending',
                        driverId: null
                    },
                    $unset: {
                        driverShare: '',
                        driverCut: '',
                        driverStatus: ''
                    }
                },
                { session, runValidators: true }
            )

            if (updateResult.modifiedCount === 0) {
                throw new CustomError('Failed to update order', 500)
            }

            // Clear cache
            await flushCache()

            // Commit transaction and end session
            await session.commitTransaction()
            session.endSession()

            return httpResponse(req, res, 201, responseMessage.OPERATION_SUCCESS, null, null, null)
        } catch (error) {
            await session.abortTransaction()

            // Handle write conflicts with exponential backoff
            if (error.message.includes('Write conflict')) {
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 100 // Exponential backoff
                    await new Promise((resolve) => setTimeout(resolve, delay))
                    continue // Retry after the delay
                } else {
                    return httpError('CANCEL BOOKING', next, new CustomError(responseMessage.CONFLICT, 409), req)
                }
            } else {
                // Handle other errors (validation, etc.)
                return httpError('CANCEL BOOKING', next, error, req, 500)
            }
        } finally {
            session.endSession()
        }
    }
}

// export const completeBooking = async (req, res, next) => {
//     const session = await mongoose.startSession()
//     session.startTransaction()

//     try {
//         const { role } = req.user
//         const { orderId } = req.body

//         // Validate role
//         if (!['Driver', 'Admin'].includes(role)) {
//             throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
//         }

//         // Validate orderId
//         if (!orderId) {
//             throw new CustomError(responseMessage.INVALID_INPUT_DATA, 400)
//         }

//         // Fetch order and validate
//         const order = await Order.findById(orderId).session(session)
//         if (!order) {
//             throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Order'), 404)
//         }

//         // Check if booking can be completed (departure date must be in the past)
//         if (new Date(order.departureDate) > new Date()) {
//             throw new CustomError(responseMessage.BOOKING_NOT_COMPLETED, 400)
//         }

//         // Fetch associated cab and validate
//         const cab = await Cab.findById(order.bookedCab).session(session)
//         if (!cab) {
//             throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
//         }

//         // Remove booking from cab
//         cab.removeBooking(orderId)
//         await cab.save({ session })

//         // Validate driver's share
//         const driverCut = order.driverShare?.driverCut || 0
//         if (driverCut < 0) {
//             throw new CustomError(responseMessage.INVALID_REQUEST, 400)
//         }

//         // Fetch driver and validate
//         const driver = await User.findById(order.driverId).session(session)
//         if (!driver) {
//             throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Driver'), 404)
//         }

//         // Initialize wallet if not present
//         if (!driver.wallet) {
//             driver.wallet = {
//                 balance: 0,
//                 currency: 'INR',
//                 transactionHistory: []
//             }
//         }

//         // Update driver's wallet or order payment details based on payment method
//         if (order.paymentMethod === 'Online') {
//             driver.wallet.balance += driverCut
//         } else {
//             order.driverShare = {
//                 ...order.driverShare,
//                 Via: 'Customer',
//                 status: 'Paid',
//                 paidAt: new Date()
//             }
//         }

//         // Save driver and order updates
//         await driver.save({ session })
//         order.bookingStatus = 'Completed'
//         await order.save({ session })

//         // Commit transaction
//         await session.commitTransaction()

//         // Clear cache and send success response
//         await flushCache()
//         return httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, null, null, null)
//     } catch (error) {
//         // Rollback transaction on error
//         await session.abortTransaction()
//         httpError('COMPLETE BOOKING', next, error, req, 500)
//     } finally {
//         // End session in the finally block to ensure it always ends
//         session.endSession()
//     }
// }

export const completeBooking = async (req, res, next) => {
    const maxRetries = 3

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const { role } = req.user
            const { orderId } = req.body

            // Validate role and input
            if (!['Driver', 'Admin'].includes(role)) {
                throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
            }
            if (!orderId) {
                throw new CustomError(responseMessage.INVALID_INPUT_DATA, 400)
            }

            // Fetch order and cab
            const order = await Order.findById(orderId).session(session)
            if (!order) {
                throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Order'), 404)
            }

            if (new Date(order.departureDate) > new Date()) {
                throw new CustomError(responseMessage.BOOKING_NOT_COMPLETED, 400)
            }

            const cab = await Cab.findById(order.bookedCab).session(session)
            if (!cab) {
                throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
            }

            // Perform booking removal and validation
            cab.removeBooking(orderId)
            await cab.save({ session })

            const driverCut = order.driverShare?.driverCut || 0
            if (driverCut < 0) {
                throw new CustomError(responseMessage.INVALID_REQUEST, 400)
            }

            const driver = await User.findById(order.driverId).session(session)
            if (!driver) {
                throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Driver'), 404)
            }

            // Initialize wallet and update payment
            if (!driver.wallet) {
                driver.wallet = {
                    balance: 0,
                    currency: 'INR',
                    transactionHistory: []
                }
            }

            let transactionEntry = {
                type: 'credit',
                amount: driverCut,
                description: '',
                isPending: false,
                orderId: order._id
            }

            if (order.paymentMethod === 'Online') {
                driver.wallet.balance += driverCut
                transactionEntry.description = 'You will get paid by us'
                transactionEntry.isPending = true // Payment is pending for online transactions
            } else if (order.paymentMethod === 'Hybrid') {
                transactionEntry.description = 'You have been paid by the passenger'
                transactionEntry.isPending = false // Hybrid payments are not pending
            }

            // Add transaction entry to driver's wallet
            driver.wallet.transactionHistory.push(transactionEntry)

            // Update driver wallet and order status
            await driver.save({ session })
            order.bookingStatus = 'Completed'

            // If hybrid, mark payment status
            if (order.paymentMethod === 'Hybrid') {
                order.driverShare = {
                    ...order.driverShare,
                    Via: 'Customer',
                    status: 'Paid',
                    paidAt: new Date()
                }
            }

            await order.save({ session })

            // Commit transaction and send response
            await session.commitTransaction()
            await flushCache()

            return httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, null, null, null)
        } catch (error) {
            await session.abortTransaction()

            // Check for transient errors like write conflicts
            if (error.message.includes('Write conflict')) {
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 100 // Exponential backoff
                    await new Promise((resolve) => setTimeout(resolve, delay))
                    continue // Retry after the delay
                } else {
                    return httpError('COMPLETE BOOKING', next, new CustomError(responseMessage.CONFLICT, 409), req)
                }
            } else {
                // Non-retryable errors (validation, etc.)
                return httpError('COMPLETE BOOKING', next, error, req, 500)
            }
        } finally {
            session.endSession()
        }
    }
}
