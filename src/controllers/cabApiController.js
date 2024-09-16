import fs from 'fs'
import responseMessage from '../constants/responseMessage.js'
import CustomError from '../utils/customeError.js'
import cloudinary from '../config/cloudinary.js'
import logger from '../utils/logger.js'
import { User } from '../models/userModel.js'
import { Cab } from '../models/cabModel.js'
import { sendMailWithRetry } from '../services/emailServices.js'
import emails from '../constants/emails.js'
import httpResponse from '../utils/httpResponse.js'
import httpError from '../utils/httpError.js'
import mongoose from 'mongoose'
import { flushCache, getCache, setCache } from '../services/cacheService.js'

export const registerCab = async (req, res, next) => {
    const tmpDir = './tmp'

    // Start a Mongoose session for transaction management
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // Check if the user is either a driver or an admin
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Ensure the tmp directory exists
        await fs.promises.mkdir(tmpDir, { recursive: true }).catch((error) => {
            logger.error(`Failed to create temp directory:`, { meta: { error } })
            throw new CustomError('Failed to create temp directory', 500)
        })

        let uploadedImages = []

        if (req.files && req.files.photos) {
            const photos = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos]

            const imagePromises = photos.map(async (image) => {
                try {
                    const myCloud = await cloudinary.v2.uploader.upload(image.tempFilePath, {
                        folder: 'TandT/Cars',
                        resource_type: 'image'
                    })

                    return {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url
                    }
                } catch (uploadError) {
                    logger.error(`Cloudinary Error: Failed to upload image ${image.name}:`, { meta: { error: uploadError } })
                    throw new CustomError(responseMessage.UPLOADING_ERROR, 500)
                }
            })

            uploadedImages = await Promise.all(imagePromises)
        } else {
            throw new CustomError(responseMessage.INVALID_INPUT_DATA, 400)
        }

        const belongsTo = await User.findById(req.user._id)
        if (!belongsTo) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('User'), 404)
        }

        const carData = {
            modelName: req.body.modelName,
            feature: req.body.feature,
            capacity: req.body.capacity,
            belongsTo: req.user._id,
            cabNumber: req.body.cabNumber,
            rate: req.body.rate,
            photos: uploadedImages
        }

        const car = await Cab.create([carData], { session })

        // Update user's haveCab field
        await User.findByIdAndUpdate(req.user._id, { haveCab: true }, { session })

        await session.commitTransaction() // Commit transaction

        // Remove tmp directory after successful upload and database operations
        await fs.promises.rm(tmpDir, { recursive: true }).catch((error) => {
            logger.error(`Failed to remove temp directory:`, { meta: { error } })
        })

        // Send email notification
        try {
            await sendMailWithRetry(
                belongsTo.email,
                responseMessage.CAB_REGISTRATION_EMAIL_SUBJECT,
                emails.CAB_REGISTRATION_SUCCESS_EMAIL(belongsTo.username)
            )
        } catch (emailError) {
            logger.error(responseMessage.EMAIL_SENDING_FAILED(belongsTo.email), { meta: { error: emailError } })
        }

        // Invalidate cache keys
        // Cachestorage.del(['all_cabs', 'all_cabs_user', 'driver_cabs']);

        httpResponse(req, res, 201, responseMessage.CAB_REGISTRATION_SUCCESS, car, null)
    } catch (error) {
        await session.abortTransaction() // Rollback in case of error
        logger.error(responseMessage.CAB_REGISTRATION_FAIL, { meta: { error } })
        httpError('CAB REGISTRATION', next, error, req, 500)
    } finally {
        session.endSession() // End session after transaction
        if (fs.existsSync(tmpDir)) {
            await fs.promises.rm(tmpDir, { recursive: true })
        }
    }
}

export const updateCab = async (req, res, next) => {
    const tmpDir = './tmp'

    // Start a Mongoose session for transaction management
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        // Check if the user is either a driver or an admin
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        const cabId = req.params.id
        const cab = await Cab.findById(cabId)
        // Check if the cab exists
        if (!cab) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
        }

        // Check if the user is the owner of the cab
        if (cab.belongsTo.toString() !== req.user._id.toString()) {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Ensure the tmp directory exists
        await fs.promises.mkdir(tmpDir, { recursive: true }).catch((error) => {
            logger.error(`Failed to create temp directory:`, { meta: { error } })
            throw new CustomError('Failed to create temp directory', 500)
        })

        let uploadedImages = []

        if (req.files && req.files.photos) {
            const photos = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos]

            // Delete existing images from Cloudinary
            const destroyPromises = cab.photos.map((photo) => cloudinary.v2.uploader.destroy(photo.public_id))
            await Promise.all(destroyPromises)

            // Upload new images to Cloudinary
            const imagePromises = photos.map(async (image) => {
                const myCloud = await cloudinary.v2.uploader.upload(image.tempFilePath, {
                    folder: 'TandT/Cars',
                    resource_type: 'image'
                })

                return {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                }
            })

            uploadedImages = await Promise.all(imagePromises)
        } else {
            // If no new images are provided, retain the old ones
            uploadedImages = cab.photos
        }

        // Construct the updated cab data

        const cabData = {
            modelName: req.body.modelName,
            feature: req.body.feature,
            capacity: req.body.capacity,
            cabNumber: req.body.cabNumber,
            photos: uploadedImages
        }

        if (req.user.role === 'Admin') {
            cabData.rate = req.body.rate
        }
        // Update the cab using a session to ensure consistency
        const updatedCab = await Cab.findByIdAndUpdate(cabId, cabData, {
            new: true,
            runValidators: true,
            session
        })
        flushCache()
        await session.commitTransaction() // Commit transaction

        // Remove tmp directory after successful operation
        await fs.promises.rm(tmpDir, { recursive: true }).catch((error) => {
            logger.error(`Failed to remove temp directory:`, { meta: { error } })
        })

        //   Cachestorage.del(['all_cabs', 'all_cabs_user', 'driver_cabs']);

        httpResponse(req, res, 201, responseMessage.CAB_UPDATE_SUCCESS, updatedCab, null)
    } catch (error) {
        await session.abortTransaction() // Rollback in case of error

        httpError('UPDATE CAB', next, error, req, 500)
    } finally {
        session.endSession() // End session after transaction
        if (fs.existsSync(tmpDir)) {
            await fs.promises.rm(tmpDir, { recursive: true })
        }
    }
}

export const getRateDefinedCab = async (req, res, next) => {
    try {
        const cacheKey = 'rateDefinedCabs'

        // Check if the data is in the cache
        const cachedCabs = getCache(cacheKey)
        if (cachedCabs) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedCabs, null)
        }

        // If not in cache, fetch from database
        const cabs = await Cab.find({ isReady: true })

        if (cabs.length === 0) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
        }

        // Cache the result for 10 minutes (600 seconds)
        setCache(cacheKey, cabs, 600)

        // Return the response with the data
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, cabs, null)
    } catch (error) {
        httpError('GET RATE DEFINED CABS', next, error, req, 500)
    }
}

export const getSingleCabs = async (req, res, next) => {
    try {
        const cacheKey = `cab_${req.params.id}`

        const cachedCab = getCache(cacheKey)
        if (cachedCab) {
            return httpResponse(req, res, 200, responseMessage.CACHE_UPDATE_SUCCESS, cachedCab, null)
        }
        const cab = await Cab.findById(req.params.id).lean()
        if (!cab) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
        }

        setCache(cacheKey, cab, 600)

        // Return the response with the data
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, cab, null)
    } catch (error) {
        httpError('GET SINGLE CAB', next, error, req, 500)
    }
}

export const getDriverOwnedCabs = async (req, res, next) => {
    try {
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }
        if (!req.user.haveCab) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
        }

        const driverOwnsCab = await Cab.find({ belongsTo: req.user._id })
            .populate({ path: 'belongsTo', select: 'username email' })
            .select('-__v')
            .lean()
        // console.log(driverOwnsCab);

        if (driverOwnsCab.length === 0 || !driverOwnsCab) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
        }
        httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, driverOwnsCab, null)
    } catch (error) {
        httpError('DRIVER OWNED CAB', next, error, req, 500)
    }
}

export const deleteCab = async (req, res, next) => {
    try {
        // Authorization check: Only 'Driver' or 'Admin' roles can delete cabs
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        const { id } = req.params
        const cab = await Cab.findById(id)

        // Check if cab exists
        if (!cab) {
            throw new CustomError(responseMessage.RESOURCE_NOT_FOUND('Cab'), 404)
        }

        // Ensure the current user is the owner of the cab or is an admin
        if (cab.belongsTo.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
        }

        // Delete associated photos from Cloudinary
        await Promise.all(cab.photos.map((photo) => cloudinary.v2.uploader.destroy(photo.public_id)))

        // Delete the cab from the database
        await Cab.deleteOne({ _id: id })

        // Invalidate all caches after cab deletion
        flushCache()

        // Check if the user has any remaining cabs and update user status if necessary
        const remainingCabs = await Cab.countDocuments({ belongsTo: req.user._id })
        if (remainingCabs === 0) {
            await User.findByIdAndUpdate(req.user._id, { haveCab: false })
        }

        // Send success response
        httpResponse(req, res, 200, responseMessage.CAB_DELETION_SUCCESS, null, null)
    } catch (error) {
        httpError('DELETE CAB', next, error, req, 500)
    }
}
