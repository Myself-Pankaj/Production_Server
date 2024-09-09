import responseMessage from '../constants/responseMessage.js';
import { User } from '../models/userModel.js';
import { delCache } from '../services/cacheService.js';
import httpResponse from '../utils/httpResponse.js';
import fs from 'fs';
import logger from '../utils/logger.js';
import CustomError from '../utils/customeError.js';
import cloudinary from '../config/cloudinary.js';
import httpError from '../utils/httpError.js';
import mongoose from 'mongoose';
import { Cab } from '../models/cabModel.js';

export const driverVerification = async (req, res, next) => {
    const tmpDir = './tmp';
    const session = await mongoose.startSession(); // Start MongoDB session
    session.startTransaction(); // Start a transaction

    try {
        // Invalidate cache for user and driver data
        delCache(['all_user', 'all_drivers']);

        // Ensure only drivers can access this route
        if (req.user.role !== 'Driver') {
            return httpResponse(req, res, 403, responseMessage.UNAUTHORIZED_ACCESS, null, null);
        }

        const user = await User.findById(req.user._id).session(session);
        if (!user) {
            throw new CustomError(responseMessage.USER_NOT_FOUND, 404);
        }

        // Ensure temporary directory exists for storing file uploads

        await fs.promises.mkdir(tmpDir, { recursive: true }).catch((error) => {
            logger.error(`Failed to create temp directory:`, { meta: { error } });
            throw new CustomError('Failed to create temp directory', 500);
        });

        // Check if documents were provided in the request
        if (!req.files || !req.files.document) {
            throw new CustomError(responseMessage.NO_DOCUMENTS_PROVIDED, 400);
        }

        const documents = Array.isArray(req.files.document) ? req.files.document : [req.files.document];
        const docNames = Array.isArray(req.body.docName) ? req.body.docName : [req.body.docName];

        // Validate the uploaded files (e.g., max size, allowed formats)
        const allowedFormats = ['image/jpeg', 'image/png', 'application/pdf'];
        documents.forEach((doc) => {
            if (!allowedFormats.includes(doc.mimetype)) {
                throw new CustomError(responseMessage.INVALID_DOCUMENT_FORMAT, 400);
            }
            if (doc.size > 2 * 1024 * 1024) {
                // Max 2MB per document
                throw new CustomError(responseMessage.FILE_TOO_LARGE, 400);
            }
        });

        const uploadedDocuments = await Promise.all(
            documents.map(async (doc, index) => {
                try {
                    // Upload documents to Cloudinary
                    const uploadResult = await cloudinary.v2.uploader.upload(doc.tempFilePath, {
                        folder: 'TandT/DriverDocuments',
                        resource_type: 'auto'
                    });
                    // Remove the temp file after upload
                    fs.unlinkSync(doc.tempFilePath);

                    return {
                        docName: docNames[index] || `Document ${index + 1}`,
                        public_id: uploadResult.public_id,
                        url: uploadResult.secure_url,
                        uploadedAt: new Date()
                    };
                } catch (uploadError) {
                    logger.error(`Document upload failed: ${doc.name}`, { meta: { error: uploadError } });
                    throw new CustomError(responseMessage.UPLOAD_FAIL, 500);
                }
            })
        );

        // Append the uploaded documents to the user's driver documents
        user.driverDocuments.push(...uploadedDocuments);
        user.isDocumentSubmited = true;
        await user.save({ session }); // Save the user within the session

        // Commit the transaction
        await session.commitTransaction();

        // Send success response
        return httpResponse(req, res, 200, responseMessage.DOCUMENTS_UPLOADED_SUCCESS, uploadedDocuments, null);
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        logger.error(responseMessage.DOCUMENTS_UPLOAD_ERROR, { meta: { error } });
        httpError(next, error, req, 500);
    } finally {
        // End the session
        session.endSession();

        // Clean up temporary files directory after operation
        if (fs.existsSync(tmpDir)) {
            await fs.promises.rm(tmpDir, { recursive: true });
        }
    }
};
//     //Not Used
// export const getDriverUpcomingBookings = async (req, res, next) => {
//     try {
//         // Ensure the user is authorized
//         if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
//             return httpResponse(req, res, 403, responseMessage.UNAUTHORIZED_ACCESS, null, null)
//         }
//         const driverId = req.user._id

//         // Find the driver's cabs
//         const driverCabs = await Cab.find({ belongsTo: driverId }).select('_id')
//         if (driverCabs.length === 0) {
//             throw new CustomError(responseMessage.CAB_NOT_FOUND, 404)
//         }

//         // Separate into assigning and confirmed bookings
//         const assigningBookings = upcomingBookings.filter((booking) => booking.bookingStatus === 'Assigning')
//         const confirmedBookings = upcomingBookings.filter((booking) => booking.bookingStatus === 'Confirmed')

//         return httpResponse(
//             req,
//             res,
//             200,
//             responseMessage.SUCCESS,
//             {
//                 assigningCount: assigningBookings.length,
//                 confirmedCount: confirmedBookings.length,
//                 bookingData: { assigning: assigningBookings, confirmed: confirmedBookings }
//             },
//             null
//         )
//     } catch (error) {
//         logger.error(responseMessage.BOOKINGS_FETCH_FAIL, { meta: { error } })
//         return httpError(next, error, req, 500)
//     }
// }

export const getDriverCompletedBookings = async (req, res, next) => {
    try {
        // Ensure the user is authorized
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            return httpResponse(req, res, 403, responseMessage.UNAUTHORIZED_ACCESS, null, null);
        }

        const driverId = req.user._id;

        const driverCabs = await Cab.find({ belongsTo: driverId })
            .populate({
                path: 'upcomingBookings',
                populate: {
                    path: 'orderId', // Populate the 'orderId' field within upcomingBookings
                    select: 'userId bookingType departureDate dropOffDate pickupLocation exactLocation destination numberOfPassengers bookingStatus paymentMethod driverShare bookingAmount paidAmount',
                    populate: {
                        path: 'userId', // Populate the user information within the order
                        select: 'firstName lastName' // Select the fields you need
                    }
                }
            })
            .select('_id upcomingBookings');
        if (driverCabs.length === 0) {
            return httpResponse(req, res, 404, responseMessage.CAB_NOT_FOUND, null, null);
        }
        // Fetch Completed bookings
        const upcomingBookings = driverCabs.flatMap((cab) => cab.upcomingBookings);

        // Separate into assigning and confirmed bookings
        const assigningBookings = upcomingBookings.filter((booking) => booking.bookingStatus === 'Assigning');
        const confirmedBookings = upcomingBookings.filter((booking) => booking.bookingStatus === 'Confirmed');

        return httpResponse(
            req,
            res,
            200,
            responseMessage.SUCCESS,
            {
                assigningCount: assigningBookings.length,
                confirmedCount: confirmedBookings.length,
                bookingData: { assigning: assigningBookings, confirmed: confirmedBookings }
            },
            null
        );
    } catch (error) {
        return httpError(next, error, req, 500);
    }
};
