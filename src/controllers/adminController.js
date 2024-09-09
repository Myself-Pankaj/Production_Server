import responseMessage from '../constants/responseMessage.js';
import { Cab } from '../models/cabModel.js';
import { User } from '../models/userModel.js';
import { flushCache, getCache, setCache } from '../services/cacheService.js';
import CustomError from '../utils/customeError.js';
import httpError from '../utils/httpError.js';
import httpResponse from '../utils/httpResponse.js';

export const allCabsAdmin = async (req, res, next) => {
    try {
        // Ensure only admins can access this route
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403);
        }

        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const cacheKey = `all_cabs_page_${page}_limit_${limit}`;

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400);
        }

        const skip = (page - 1) * limit;

        // Check if the data is in the cache
        const cachedCabs = getCache(cacheKey);
        if (cachedCabs) {
            return httpResponse(req, res, 200, responseMessage.CACHE_SUCCESS, cachedCabs, null);
        }

        // Fetch from DB with pagination
        const cabs = await Cab.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

        if (!cabs || cabs.length === 0) {
            return httpResponse(req, res, 404, responseMessage.CAB_NOT_FOUND, null, null, null);
        }

        // Total number of cabs for pagination meta info
        const totalCabs = await Cab.countDocuments();

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalCabs / limit),
            totalItems: totalCabs
        };

        // Cache the result for future use
        setCache(cacheKey, cabs, 3600); // Cache for 1 hour

        // Send response
        httpResponse(req, res, 200, responseMessage.SUCCESS, cabs, null, pagination);
    } catch (error) {
        // Log the error and pass it to the error handler
        httpError(next, error, req, error.statusCode || 500);
    }
};

///Users
export const allUserAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403);
        }
        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const cacheKey = `all_user_page_${page}_limit_${limit}`;

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400);
        }

        const skip = (page - 1) * limit;

        // Check if the data is in the cache
        const cachedUser = getCache(cacheKey);
        if (cachedUser) {
            return httpResponse(req, res, 200, responseMessage.CACHE_SUCCESS, cachedUser, null);
        }

        // Fetch from DB with pagination
        const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

        setCache(cacheKey, users, 3600); // Cache for 1 hour
        if (!users || users.length === 0) {
            throw new CustomError(responseMessage.USER_NOT_FOUND, 404);
        }

        // Total number of cabs for pagination meta info
        const totalUsers = await User.countDocuments();

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalItems: totalUsers
        };

        // Send response
        httpResponse(req, res, 200, responseMessage.SUCCESS, users, null, pagination);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

export const allDriversAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403);
        }
        // Validate pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const cacheKey = `all_driver_page_${page}_limit_${limit}`;

        if (page < 1 || limit < 1) {
            throw new CustomError('Pagination Error', 400);
        }

        const skip = (page - 1) * limit;

        // Check if the data is in the cache
        const cachedDriver = getCache(cacheKey);
        if (cachedDriver) {
            return httpResponse(req, res, 200, responseMessage.CACHE_SUCCESS, cachedDriver, null);
        }
        const drivers = await User.find({ role: 'Driver' }).sort({ createdAt: 1 }).skip(skip).limit(limit).lean();

        setCache(cacheKey, drivers, 3600); // Cache for 1 hour
        if (!drivers || drivers.length === 0) {
            return httpResponse(req, res, 404, responseMessage.USER_NOT_FOUND, null, null, null);
        }

        const totalDriver = await User.countDocuments();

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalDriver / limit),
            totalItems: totalDriver
        };

        // Send response
        httpResponse(req, res, 200, responseMessage.SUCCESS, totalDriver, null, pagination);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

export const getAvailableCabs = async (req, res, next) => {
    try {
        // Ensure only Admins can access this route
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403);
        }

        const { capacity, date } = req.body;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!capacity || !date) {
            throw new CustomError(responseMessage.INVALID_FORMAT, 400);
        }

        const requestDate = new Date(date);

        // Calculate the date range (24 hours before and after)
        const startDate = new Date(requestDate.getTime() - 24 * 60 * 60 * 1000);
        const endDate = new Date(requestDate.getTime() + 24 * 60 * 60 * 1000);

        // Find cabs that match the capacity and are not booked in the specified date range
        const availableCabs = await Cab.find({
            capacity: capacity,
            upcomingBookings: {
                $not: {
                    $elemMatch: {
                        departureDate: { $gte: startDate, $lt: endDate }
                    }
                }
            }
        })
            .lean() // Use lean to return plain JavaScript objects
            .select('modelName type capacity feature cabNumber rate belongsTo') // Select only necessary fields
            .populate({
                path: 'belongsTo',
                select: 'username email phoneNumber isVerifiedDriver',
                match: { isVerifiedDriver: true }
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by latest created

        const totalCabs = await Cab.countDocuments({
            capacity: capacity,
            upcomingBookings: {
                $not: {
                    $elemMatch: {
                        departureDate: { $gte: startDate, $lt: endDate }
                    }
                }
            }
        });

        const filteredCabs = availableCabs
            .filter((cab) => cab.belongsTo)
            .map((cab) => ({
                cabId: cab._id,
                modelName: cab.modelName,
                type: cab.type,
                capacity: cab.capacity,
                feature: cab.feature,
                cabNumber: cab.cabNumber,
                rate: cab.rate,
                driver: {
                    name: cab.belongsTo.username,
                    email: cab.belongsTo.email,
                    phoneNumber: cab.belongsTo.phoneNumber
                }
            }));

        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalCabs / limit),
            totalItems: totalCabs
        };

        httpResponse(req, res, 200, responseMessage.SUCCESS, filteredCabs, null, pagination);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

export const setRateForCab = async (req, res, next) => {
    try {
        if (req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403);
        }

        const rate = req.body.rate;
        const cabId = req.params.id;

        if (!cabId || !rate) {
            throw new CustomError(responseMessage.INVALID_FORMAT, 400);
        }

        if (isNaN(rate) || rate <= 0) {
            throw new CustomError(responseMessage.INVALID_FORMAT, 400);
        }

        const updatedCab = await Cab.findById(cabId);

        if (!updatedCab) {
            throw new CustomError(responseMessage.CAB_NOT_FOUND, 400);
        }
        if (rate === 1) {
            updatedCab.rate = rate;
            updatedCab.isReady = false;
            await updatedCab.save();
        } else {
            updatedCab.rate = rate;
            updatedCab.isReady = true;
            await updatedCab.save();
        }

        flushCache();

        httpResponse(req, res, 200, responseMessage.CAB_SET_RATE_SUCCESS, updatedCab, null, null);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};
