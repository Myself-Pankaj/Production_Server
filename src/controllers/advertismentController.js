import cloudinary from '../config/cloudinary.js'
import responseMessage from '../constants/responseMessage.js'
import { Advertisment } from '../models/addModel.js'
import CustomError from '../utils/customeError.js'
import fs from 'fs'
import httpResponse from '../utils/httpResponse.js'
import httpError from '../utils/httpError.js'

export default {
    addOrUpdateBanner: async (req, res, next) => {
        try {
            const { bannerPosition } = req.body

            // Check if user has admin privileges
            if (req.user.role !== 'Admin') {
                throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
            }

            // Validate banner position
            if (!['bannerFirst', 'bannerSecond', 'bannerThird'].includes(bannerPosition)) {
                throw new CustomError('Invalid banner position', 400)
            }

            // Validate if the file is provided
            if (!req.files || !req.files.banner) {
                throw new CustomError('No banner file uploaded', 400)
            }

            const banner = req.files.banner
            const mimeType = banner.mimetype

            // Determine if the file is a video or a GIF
            const isVideo = mimeType.startsWith('video/')
            const isGif = mimeType === 'image/gif'

            if (!isVideo && !isGif) {
                throw new CustomError('Only GIF and video formats are supported', 400)
            }

            // Find the current advertisment or create a new one
            let advertisment = await Advertisment.findOne()

            if (!advertisment) {
                advertisment = new Advertisment()
            }

            // If there's already a banner in this position, delete it from Cloudinary
            if (advertisment[bannerPosition] && advertisment[bannerPosition].public_id) {
                await cloudinary.v2.uploader.destroy(advertisment[bannerPosition].public_id)
            }

            // Set resource type based on file type
            const resourceType = isVideo ? 'video' : 'image'

            // Upload the new banner to Cloudinary
            const myCloud = await cloudinary.v2.uploader.upload(banner.tempFilePath, {
                folder: 'TandT/Advertisment',
                resource_type: resourceType
            })

            // Clean up temporary file
            fs.unlinkSync(banner.tempFilePath)

            // Update the advertisment with the new banner details
            advertisment[bannerPosition] = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }

            // Save the updated advertisment to the database
            await advertisment.save()

            // Send success response
            return httpResponse(req, res, 201, responseMessage.OPERATION_SUCCESS, null, null, null)
        } catch (error) {
            // Log and handle the error
            return httpError('Advertisment Controller', next, error, req, 500)
        }
    },

    // Delete a specific banner
    deleteBanner: async (req, res, next) => {
        try {
            const { bannerPosition } = req.query
            if (req.user.role !== 'Admin') {
                throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403)
            }

            if (!['bannerFirst', 'bannerSecond', 'bannerThird'].includes(bannerPosition)) {
                throw new CustomError('Invalid banner position', 400)
            }

            // Find the advertisment document
            const advertisment = await Advertisment.findOne()
            if (!advertisment || !advertisment[bannerPosition]) {
                throw new CustomError('Advertisment or banner not found', 404)
            }

            const publicId = advertisment[bannerPosition]?.public_id
            if (publicId) {
                await cloudinary.v2.uploader.destroy(publicId)
            }

            await Advertisment.updateOne({}, { $unset: { [bannerPosition]: '' } })

            return httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, null, null, null)
        } catch (error) {
            return httpError('Delete Advertisment', next, error, req, 500)
        }
    },

    // Get all banners
    getBanners: async (req, res, next) => {
        try {
            // if (req.user.role !== 'Admin') {
            //     throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403);
            // }
            const advertisment = await Advertisment.findOne()
            if (!advertisment) {
                return next(new CustomError('No advertisments found', 404))
            }

            const resData = [advertisment.bannerFirst.url, advertisment.bannerSecond.url, advertisment.bannerThird.url]
            httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, resData, null, null)
        } catch (error) {
            return httpError('Get Banner', next, error, req, 500)
        }
    }
}
