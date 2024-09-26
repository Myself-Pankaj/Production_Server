import responseMessage from '../constants/responseMessage.js'
import { Cab } from '../models/cabModel.js'
import { Order } from '../models/orderModel.js'
import { User } from '../models/userModel.js'
import { flushCache, getCache, setCache } from '../services/cacheService.js'
import CustomError from '../utils/customeError.js'
import { calculatePercentage } from '../utils/statistics.js'
import httpError from '../utils/httpError.js'
import httpResponse from '../utils/httpResponse.js'
import { EApplicationEnvironment } from '../constants/application.js'

import logger from '../utils/logger.js'
import { fundTransfer, setupRazorpayAccount } from '../services/payoutService.js'
import { sendMailWithRetry } from '../services/emailServices.js'
import emails from '../constants/emails.js'
import date from '../utils/date.js'

export const allCabsAdmin = async (req, res, next) => {
    try {
        // Ensure only admins can access this route
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const cacheKey = `all_cabs_page_${page}_limit_${limit}`

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400)
        }

        const skip = (page - 1) * limit

        // Check if the data is in the cache
        const cachedCabs = getCache(cacheKey)
        if (cachedCabs) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedCabs, null)
        }

        // Fetch from DB with pagination
        const cabs = await Cab.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

        if (!cabs || cabs.length === 0) {
            return httpResponse(req, res, 404, responseMessage.RESOURCE_NOT_FOUND('Cab'), null, null, null)
        }

        // Total number of cabs for pagination meta info
        const totalCabs = await Cab.countDocuments()

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalCabs / limit),
            totalItems: totalCabs
        }

        // Cache the result for future use
        setCache(cacheKey, cabs, 3600) // Cache for 1 hour

        // Send response
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, cabs, null, pagination)
    } catch (error) {
        // Log the error and pass it to the error handler
        httpError('ALL ADMIN CABS', next, error, req, 500)
    }
}
export const allAssignBookingAdmin = async (req, res, next) => {
    try {
        // Ensure only admins can access this route
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const cacheKey = `all_assign_booking_page_${page}_limit_${limit}`

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400)
        }

        const skip = (page - 1) * limit

        // Check if the data is in the cache
        const cachedBooking = getCache(cacheKey)
        if (cachedBooking) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedBooking, null)
        }

        // Fetch from DB with pagination
        const order = await Order.find({ bookingStatus: 'Assigning' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().populate({
            path: 'driverId',
            select: 'username email phoneNumber'
        })

        if (!order || order.length === 0) {
            return httpResponse(req, res, 404, responseMessage.RESOURCE_NOT_FOUND('Order'), null, null, null)
        }

        // Total number of cabs for pagination meta info
        const totalOrders = order.length

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalItems: totalOrders
        }
        flushCache()
        // Cache the result for future use
        setCache(cacheKey, order, 3600) // Cache for 1 hour

        // Send response
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, order, null, pagination)
    } catch (error) {
        // Log the error and pass it to the error handler
        httpError('ALL ASSIGN BOOKING', next, error, req, 500)
    }
}
///Users
export const allUserAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }
        flushCache()

        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const cacheKey = `all_user_page_${page}_limit_${limit}`

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400)
        }

        const skip = (page - 1) * limit

        // Check if the data is in the cache
        const cachedUser = getCache(cacheKey)
        if (cachedUser) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedUser, null)
        }

        // Fetch from DB with pagination
        const users = await User.find({ role: 'Passenger' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

        if (!users || users.length === 0) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Users'), 404)
        }

        // Count the total number of users with role 'Passenger'
        const totalUsers = await User.countDocuments({ role: 'Passenger' })

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalItems: totalUsers
        }

        // setCache(cacheKey, users, 3600) // Cache for 1 hour
        // Send response
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, users, null, pagination)
    } catch (error) {
        httpError('ALL ADMIN USER', next, error, req, 500)
    }
}

export const allDriversAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }
        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const cacheKey = `all_driver_page_${page}_limit_${limit}`

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400)
        }

        const skip = (page - 1) * limit

        // Check if the data is in the cache
        const cachedDriver = getCache(cacheKey)
        if (cachedDriver) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedDriver, null)
        }
        const drivers = await User.find({ role: 'Driver' }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

        if (!drivers || drivers.length === 0) {
            return httpResponse(req, res, 404, responseMessage.RESOURCE_NOT_FOUND('User'), null, null, null)
        }

        const totalDriver = await User.countDocuments({ role: 'Driver' })

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalDriver / limit),
            totalItems: totalDriver
        }
        setCache(cacheKey, drivers, 3600) // Cache for 1 hour
        // Send response
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, drivers, null, pagination)
    } catch (error) {
        httpError('ALL ADIMN DRIVER', next, error, req, 500)
    }
}

export const allUnverifiedDriver = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }
        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const cacheKey = `all_unverified_driver_page_${page}_limit_${limit}`

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400)
        }

        const skip = (page - 1) * limit

        // Check if the data is in the cache
        const cachedDriver = getCache(cacheKey)
        if (cachedDriver) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedDriver, null)
        }
        const drivers = await User.find({
            role: 'Driver',
            isVerifiedDriver: false // Additional condition for verified drivers
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        if (!drivers || drivers.length === 0) {
            return httpResponse(req, res, 404, responseMessage.RESOURCE_NOT_FOUND('User'), null, null, null)
        }

        const totalDriver = await User.countDocuments({ role: 'Driver', isVerifiedDriver: true })

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalDriver / limit),
            totalItems: totalDriver
        }
        setCache(cacheKey, drivers, 3600) // Cache for 1 hour
        // Send response
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, drivers, null, pagination)
    } catch (error) {
        httpError('ALL ADIMN DRIVER', next, error, req, 500)
    }
}

export const allOrdersAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }
        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5
        const cacheKey = `all_order_page_${page}_limit_${limit}`

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400)
        }

        const skip = (page - 1) * limit

        // Check if the data is in the cache
        const cachedOrder = getCache(cacheKey)
        if (cachedOrder) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedOrder, null)
        }
        const orders = await Order.find().sort({ createdAt: 1 }).skip(skip).limit(limit).lean()

        if (!orders || orders.length === 0) {
            return httpResponse(req, res, 404, responseMessage.RESOURCE_NOT_FOUND('Booking'), null, null, null)
        }

        const totalOrders = orders.length

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalItems: totalOrders
        }
        setCache(cacheKey, orders, 3600) // Cache for 1 hour
        // Send response
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, orders, null, pagination)
    } catch (error) {
        httpError('ALL ADIMN ORDER', next, error, req, 500)
    }
}

export const getAvailableCabs = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }
        flushCache()

        const { capacity, date } = req.body
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 1
        const skip = (page - 1) * limit

        if (!capacity || !date) {
            throw new CustomError(responseMessage.INVALID_INPUT_DATA, 400)
        }

        const requestDate = new Date(date)

        const startDate = new Date(requestDate.getTime() - 24 * 60 * 60 * 1000)
        const endDate = new Date(requestDate.getTime() + 24 * 60 * 60 * 1000)

        const allCabs = await Cab.find({
            capacity: capacity,
            upcomingBookings: {
                $not: {
                    $elemMatch: {
                        departureDate: { $gte: startDate, $lt: endDate }
                    }
                }
            }
        })
            .lean()
            .select('modelName type capacity feature cabNumber rate belongsTo')
            .populate({
                path: 'belongsTo',
                select: 'username email phoneNumber isVerifiedDriver',
                match: { isVerifiedDriver: true }
            })
            .sort({ createdAt: -1 })
        const filteredCabs = allCabs.filter((cab) => cab.belongsTo)

        const totalCabs = filteredCabs.length

        const paginatedCabs = filteredCabs.slice(skip, skip + limit).map((cab) => ({
            cabId: cab._id,
            modelName: cab.modelName,
            type: cab.type,
            capacity: cab.capacity,
            feature: cab.feature,
            cabNumber: cab.cabNumber,
            driver: {
                name: cab.belongsTo.username,
                email: cab.belongsTo.email,
                phoneNumber: cab.belongsTo.phoneNumber
            }
        }))

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalCabs / limit),
            totalItems: totalCabs
        }

        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, paginatedCabs, null, pagination)
    } catch (error) {
        httpError('AVAILABLE CAB', next, error, req, 500)
    }
}

export const setRateForCab = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        const rate = req.body.rate
        const cabId = req.params.id

        if (!cabId || !rate) {
            throw new CustomError(responseMessage.INVALID_FORMAT, 400)
        }

        if (isNaN(rate) || rate <= 0) {
            throw new CustomError(responseMessage.INVALID_FORMAT, 400)
        }

        const updatedCab = await Cab.findById(cabId)

        if (!updatedCab) {
            throw new CustomError(responseMessage.CAB_NOT_FOUND, 400)
        }
        if (rate === 1) {
            updatedCab.rate = rate
            updatedCab.isReady = false
            await updatedCab.save()
        } else {
            updatedCab.rate = rate
            updatedCab.isReady = true
            await updatedCab.save()
        }

        flushCache()

        httpResponse(req, res, 200, responseMessage.CAB_SET_RATE_SUCCESS, updatedCab, null, null)
    } catch (error) {
        httpError(next, error, req, 500)
    }
}

export const adminStats = async (req, res, next) => {
    const cacheKey = 'adminStats'
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }
        const cachedStats = getCache(cacheKey)
        if (cachedStats) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedStats)
        }
        let stats = {}
        const today = new Date()
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }

        // Fetch promises in parallel for efficiency
        const [
            thisMonthCabs,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthCabs,
            lastMonthUsers,
            lastMonthOrders,
            cabCount,
            orderCount,
            userCount,
            lastSixMonthOrders,
            cabTypes, // Cab capacities
            userTypes,
            latestTransaction,
            passenger
        ] = await Promise.all([
            Cab.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            User.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            Order.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
            Cab.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            User.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            Order.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
            Cab.countDocuments(),
            Order.find({}).select('bookingAmount'),
            User.countDocuments(),
            Order.find({ createdAt: { $gte: sixMonthsAgo, $lte: today } }),
            Cab.distinct('capacity'),
            User.find({ role: 'Driver' }),

            Order.find({ bookingStatus: 'Pending' }).select(['bookingAmount', 'paymentMethod', 'bookingStatus', 'createdAt']).limit(2),
            User.find({ role: 'Passenger' })
        ])

        // Calculate monthly revenue and total order count
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.bookingAmount || 0), 0)
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.bookingAmount || 0), 0)
        const revenue = orderCount.reduce((total, order) => total + (order.bookingAmount || 0), 0)

        // Count summary
        const count = {
            revenue,
            users: userCount,
            cabs: cabCount,
            order: orderCount.length
        }

        // Calculate percentage change
        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            cabs: calculatePercentage(thisMonthCabs.length, lastMonthCabs.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length)
        }

        // Chart Data (last 6 months: total transactions and revenue per month)
        const orderMonthCounts = new Array(6).fill(0)
        const orderMonthlyRevenue = new Array(6).fill(0)

        lastSixMonthOrders.forEach((order) => {
            const monthDiff = (today.getMonth() - order.createdAt.getMonth() + 12) % 12
            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1
                orderMonthlyRevenue[6 - monthDiff - 1] += order.bookingAmount
            }
        })

        // Type count (count cabs by capacity)
        const typeOfCabsCountPromise = cabTypes.map((capacity) => Cab.countDocuments({ capacity }))
        const typeOfCabsCount = await Promise.all(typeOfCabsCountPromise)

        const typeCount = cabTypes.map((capacity, i) => ({
            capacity: capacity,
            count: typeOfCabsCount[i]
        }))

        // User ratio (Passengers vs Drivers)
        const userRatio = {
            Admin: userCount - (passenger.length + userTypes.length),
            Passenger: passenger.length,
            Driver: userTypes.length
        }

        // Latest transactions with necessary fields
        const modifiedLatestTransaction = latestTransaction.map((txn) => ({
            _id: txn._id,
            bookingAmount: txn.bookingAmount,
            paymentMethod: txn.paymentMethod,
            bookingStatus: txn.bookingStatus,
            createdAt: txn.createdAt
        }))

        // Assemble final stats object
        stats = {
            typeCount,
            modifiedLatestTransaction,
            totalRevenue: Math.round(revenue),
            changePercent,
            count,
            userRatio,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            }
        }

        //Caching
        setCache(cacheKey, stats, 600)
        // Respond with stats data
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, stats, null, null)
    } catch (error) {
        httpError('ADMIN STATS', next, error, req, 500)
    }
}

// export const assignBooking = async (req, res, next) => {
//     if (req.user.role !== 'Admin') {
//         throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
//     }

//     const { id } = req.params
//     const { newCabId } = req.body

//     if (!id || !newCabId) {
//         throw new CustomError(responseMessage.INVALID_INPUT_DATA, 403)
//     }

//     try {
//         // Fetch the order
//         const order = await Order.findById(id)
//         if (!order) {
//             throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Booking'), 404)
//         }

//         // Fetch the cab
//         const cab = await Cab.findById(newCabId)
//         if (!cab) {
//             throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
//         }

//         // Calculate driver cut based on payment method
//         let driverCut = order.bookingAmount // Full amount by default

//         driverCut = order.bookingAmount - EApplicationEnvironment.HYBRID_PAYMENT_PERCENTAGE * order.bookingAmount

//         // Update order details
//         order.driverId = cab.belongsTo
//         order.bookedCab = newCabId
//         order.bookingStatus = 'Assigning'
//         let pay = order.paymentMethod !== 'Online' ? 'Customer' : 'Us'

//         // Assign the driver's share
//         order.driverShare = {
//             driverCut: driverCut,
//             Via: pay
//         }

//         // Save the order
//         await order.save()

//         // Add booking to cab
//         await cab.addBooking(order._id, order.departureDate, order.dropOffDate)

//         // Clear cache
//         await flushCache()
//         //sending emails
//            // Send confirmation email to driver
//            try {
//             const formattedPickUpDate = date.formatShortDate(order.departureDate)
//             const formattedDropOffDate = date.formatShortDate(order.dropOffDate)
//             const location = order.exactLocation || order.pickupLocation

//             await sendMailWithRetry(
//                 req.user.email,
//                 responseMessage.ORDER_CREATION_EMAIL_SUBJECT,
//                 emails.ORDER_CREATION_SUCCESS_EMAIL(
//                     req.user.username,
//                     formattedPickUpDate,
//                     order._id,
//                     location,
//                     formattedDropOffDate,
//                     order.paymentMethod,
//                     order.paidAmount,
//                     order.bookingAmount
//                 )
//             )
//         } catch (emailError) {
//             logger.error(responseMessage.EMAIL_SENDING_FAILED(req.user.email), { meta: { error: emailError } })
//             // Continue as the payment is successful
//         }

//           // Send confirmation email to user
//           try {
//             const formattedPickUpDate = date.formatShortDate(order.departureDate)
//             const formattedDropOffDate = date.formatShortDate(order.dropOffDate)
//             const location = order.exactLocation || order.pickupLocation

//             await sendMailWithRetry(
//                 req.user.email,
//                 responseMessage.ORDER_CREATION_EMAIL_SUBJECT,
//                 emails.ORDER_CREATION_SUCCESS_EMAIL(
//                     req.user.username,
//                     formattedPickUpDate,
//                     order._id,
//                     location,
//                     formattedDropOffDate,
//                     order.paymentMethod,
//                     order.paidAmount,
//                     order.bookingAmount
//                 )
//             )
//         } catch (emailError) {
//             logger.error(responseMessage.EMAIL_SENDING_FAILED(req.user.email), { meta: { error: emailError } })
//             // Continue as the payment is successful
//         }
//         httpResponse(req, res, 201, responseMessage.CAB_ASSIGN_SUCCESS, null, null, null)
//     } catch (error) {
//         httpError('ASSIGNING CAB', next, error, req, 500)
//     }
// }

export const assignBooking = async (req, res, next) => {
    if (req.user.role !== 'Admin') {
        throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
    }

    const { id } = req.params
    const { newCabId } = req.body

    if (!id || !newCabId) {
        throw new CustomError(responseMessage.INVALID_INPUT_DATA, 403)
    }

    try {
        // Fetch the order and populate user details
        const order = await Order.findById(id).populate('userId', 'email username')
        if (!order) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Booking'), 404)
        }

        // Fetch the cab and populate driver details
        const cab = await Cab.findById(newCabId).populate('belongsTo', 'email username')
        if (!cab) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
        }

        // Calculate driver cut based on payment method
        let driverCut = order.bookingAmount // Full amount by default
        driverCut = order.bookingAmount - EApplicationEnvironment.HYBRID_PAYMENT_PERCENTAGE * order.bookingAmount

        // Update order details
        order.driverId = cab.belongsTo._id
        order.bookedCab = newCabId
        order.bookingStatus = 'Assigning'
        let pay = order.paymentMethod !== 'Online' ? 'Customer' : 'Us'

        // Assign the driver's share
        order.driverShare = {
            driverCut: driverCut,
            Via: pay
        }

        // Save the order
        await order.save()

        // Add booking to cab
        await cab.addBooking(order._id, order.departureDate, order.dropOffDate)

        // Clear cache
        await flushCache()

        // Prepare formatted dates for emails
        const formattedPickUpDate = date.formatShortDate(order.departureDate)
        const formattedDropOffDate = date.formatShortDate(order.dropOffDate)
        const location = order.exactLocation || order.pickupLocation

        // Send confirmation email to driver
        try {
            await sendMailWithRetry(
                cab.belongsTo.email, // Driver's email
                responseMessage.DRIVER_ASSIGNMENT_EMAIL_SUBJECT,
                emails.DRIVER_ASSIGNMENT_EMAIL(
                    cab.belongsTo.username, // Driver's name
                    order._id,
                    formattedPickUpDate,
                    location,
                    formattedDropOffDate,
                    order.paymentMethod,
                    driverCut
                )
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SENDING_FAILED(cab.belongsTo.email), { meta: { error: emailError } })
            // Continue as the assignment is successful
        }

        httpResponse(req, res, 201, responseMessage.CAB_ASSIGN_SUCCESS, null, null, null)
    } catch (error) {
        httpError('ASSIGNING CAB', next, error, req, 500)
    }
}

export const getDriverInfoById = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        const { id } = req.params

        if (!id) {
            throw new CustomError(responseMessage.INVALID_INPUT_DATA, 400)
        }

        // Corrected: Passing 'id' directly to findById
        const driver = await User.findById(id)

        if (!driver) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Driver'), 404)
        }

        // Find the cab associated with this driver
        const cab = await Cab.findOne({ belongsTo: id })

        if (!cab) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
        }

        // Update upcoming bookings
        cab.updateUpcomingBookings()
        await cab.save() // Ensure save() is needed after this method

        const driverInfo = {
            _id: driver._id,
            username: driver.username,
            email: driver.email,
            phoneNumber: driver.phoneNumber,
            isVerified: driver.isVerified,
            isVerifiedDriver: driver.isVerifiedDriver,
            isDocumentSubmited: driver.isDocumentSubmited,
            driverDocuments: driver.driverDocuments,
            haveCab: driver.haveCab,
            avatar: driver.avatar,
            createdAt: driver.createdAt,
            cab: {
                cabId: cab._id,
                modelName: cab.modelName,
                type: cab.type,
                capacity: cab.capacity,
                feature: cab.feature,
                cabNumber: cab.cabNumber,
                availability: cab.availability,
                rate: cab.rate,
                isReady: cab.isReady,
                photos: cab.photos,
                upcomingBookings: cab.upcomingBookings,
                pastBookings: cab.pastBookings // Added pastBookings
            }
        }

        // Send the response with driver info
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, driverInfo, null, null)
    } catch (error) {
        // Adjusting to capture proper error status code

        httpError('GET DRIVER INFO BY ID', next, error, req, 500)
    }
}

export const verifyDriver = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }
        flushCache()
        const { id } = req.params
        const { flag } = req.body

        if (!id) {
            throw new CustomError(responseMessage.INVALID_INPUT_DATA, 404)
        }

        if (typeof flag !== 'boolean') {
            throw new CustomError(responseMessage.INVALID_INPUT_DATA, 400)
        }
        const driver = await User.findOne({ _id: id, role: 'Driver' })

        if (!driver) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Driver'), 404)
        }

        if (!driver.haveCab) {
            throw new CustomError(responseMessage.INVALID_REQUEST, 400)
        }

        if (driver.driverDocuments <= 0) {
            throw new CustomError(responseMessage.INVALID_DOCUMENT_FORMAT, 400)
        }

        // Verify the driver
        const updatedDriver = await User.findByIdAndUpdate(id, { isVerifiedDriver: flag }, { new: true, runValidators: true })

        if (!updatedDriver) {
            // return res.status(500).json({ success: false, message: "Error in verifying the driver." });
            throw new CustomError(responseMessage.SERVER_FAILURE, 400)
        }

        let message
        if (flag) {
            message = responseMessage.VERIFICATION_COMPLETE
        } else {
            message = responseMessage.VERIFICATION_REVOKED
        }
        try {
            await sendMailWithRetry(
                driver.email, // Driver's email
                responseMessage.DRIVER_VERIFICATION_EMAIL_SUBJECT,
                flag ? emails.DRIVER_VERIFIED(driver.username) : emails.DRIVER_VERIFICATION_REVOKED(driver.username)
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SENDING_FAILED(driver.email), { meta: { error: emailError } })
            // Continue as the verification is successful
        }
        httpResponse(req, res, 200, message, null, null, null)
    } catch (error) {
        httpError('DRIVER VERIFICATION', next, error, req, 500)
    }
}

export const allPaymentInfo = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1 // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10 // Default to 10 items per page if not provided
        const skip = (page - 1) * limit // Calculate the number of documents to skip

        // Find users with non-zero wallet balance and pending transactions
        const usersWithPendingTransactions = await User.find({
            'wallet.balance': { $ne: 0 },
            role: 'Driver'
        })
            .select('_id email wallet bankDetails')
            .lean()

        if (!usersWithPendingTransactions || usersWithPendingTransactions.length === 0) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Driver'), 404)
        }

        // Create a list of individual transaction entries, one per pending transaction
        const transactionEntries = []

        usersWithPendingTransactions.forEach((user) => {
            user.wallet.transactionHistory.forEach((transaction) => {
                transactionEntries.push({
                    userId: user._id,
                    email: user.email,
                    bankDetails: user.bankDetails,
                    transaction: {
                        amount: transaction.amount,
                        currency: user.wallet.currency,
                        transactionDate: transaction.transactionDate,
                        description: transaction.description,
                        orderId: transaction.orderId,
                        isPending: transaction.isPending
                    }
                })
            })
        })

        // Paginate the results
        const paginatedEntries = transactionEntries.slice(skip, skip + limit)
        const totalEntries = transactionEntries.length
        const totalPages = Math.ceil(totalEntries / limit)

        // Prepare pagination object
        const pagination = {
            totalEntries,
            totalPages,
            currentPage: page,
            limit
        }

        // Send response with separate pagination
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, paginatedEntries, null, pagination)
    } catch (error) {
        httpError('ALL PAYMENT INFO', next, error, req, 500)
    }
}

export const pendingPaymentInfo = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Find users with non-zero wallet balance and pending transactions
        const usersWithPendingTransactions = await User.find({
            'wallet.balance': { $ne: 0 },
            role: 'Driver',
            'wallet.transactionHistory.isPending': true
        })
            .select('_id email wallet bankDetails') // Select only the relevant fields
            .lean()

        if (!usersWithPendingTransactions || usersWithPendingTransactions.length === 0) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Driver'), 404)
        }

        // Create a list of individual transaction entries, one per pending transaction
        const transactionEntries = []

        usersWithPendingTransactions.forEach((user) => {
            user.wallet.transactionHistory.forEach((transaction) => {
                if (transaction.isPending) {
                    transactionEntries.push({
                        userId: user._id,
                        email: user.email,
                        bankDetails: user.bankDetails,
                        transaction: {
                            amount: transaction.amount,
                            currency: user.wallet.currency,
                            transactionDate: transaction.transactionDate,
                            description: transaction.description,
                            orderId: transaction.orderId,
                            isPending: transaction.isPending
                        }
                    })
                }
            })
        })

        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, transactionEntries, null, null)
    } catch (error) {
        httpError('ALL PAYMENT INFO', next, error, req, 500)
    }
}

export const payoutController = async (req, res, next) => {
    try {
        // Authorization check
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Input validation
        const { userId, amount, orderId } = req.body
        if (!userId || !amount || !orderId) {
            throw new CustomError(responseMessage.INVALID_INPUT_DATA, 400)
        }

        // Fetch user and validate
        const user = await User.findById(userId)
        if (!user) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('User'), 404)
        }

        // Check for sufficient wallet balance and valid bank details
        if (!user.wallet || !user.wallet.bankDetails) {
            throw new CustomError('Insufficient funds or missing bank details', 400)
        }

        // Razorpay payout process
        let transferResult
        if (!user.wallet.bankDetails.fundAcc) {
            try {
                const accountSetup = await setupRazorpayAccount(user, orderId)
                if (accountSetup.validationStatus !== 'created') {
                    throw new CustomError('Fund account validation failed', 400)
                }
                user.wallet.bankDetails.fundAcc = accountSetup.fundAccountId
                await user.save()
            } catch (error) {
                logger.error('Razorpay account setup failed:', error)
                throw new CustomError('Failed to set up Razorpay account', 500)
            }
        }

        try {
            transferResult = await fundTransfer(user.wallet.bankDetails.fundAcc, amount, user, orderId)
        } catch (error) {
            logger.error('Fund transfer failed:', error)
            throw new CustomError('Failed to transfer funds', 500)
        }

        // Update user's wallet
        const updateResult = await User.updateOne(
            { _id: userId, 'wallet.transactionHistory.orderId': orderId },
            {
                $set: {
                    'wallet.transactionHistory.$.isPending': false,
                    'wallet.transactionHistory.$.payoutId': transferResult.id,
                    'wallet.transactionHistory.$.transactionDate': new Date(),
                    'wallet.transactionHistory.$.description': `Payout via ${transferResult.mode}`
                },
                $inc: { 'wallet.balance': -amount }
            }
        )

        if (updateResult.nModified === 0) {
            logger.warn(`No wallet update for user ${userId} and order ${orderId}`)
        }

        // Update the order
        const order = await Order.findById(orderId)
        if (!order) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Order'), 404)
        }

        order.driverShare.Via = transferResult.mode
        order.driverShare.status = 'Paid'
        order.driverShare.paidAt = new Date()
        await order.save()

        try {
            await sendMailWithRetry(
                user.email, // Driver's email
                responseMessage.PAYOUT_EMAIL_SUBJECT(order._id),
                emails.PAYOUT_SUCCESS_EMAIL(user.username, amount, orderId)
            )
            logger.info(`Payout email sent successfully to user ${user.email}`)
        } catch (emailError) {
            logger.error(`Failed to send payout email to user ${user.email}:`, emailError)
            // Continue as the payout is successful
        }
        // Return success response
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, transferResult, null, null)
    } catch (error) {
        httpError('PAYOUT_CONTROLLER', next, error, req, 500)
    }
}
