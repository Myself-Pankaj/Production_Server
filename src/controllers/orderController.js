import razorpayInstance from '../config/razorpay.js';
import { EApplicationEnvironment } from '../constants/application.js';
import responseMessage from '../constants/responseMessage.js';
import { Order } from '../models/orderModel.js';
import { delCache, getCache, setCache } from '../services/cacheService.js';
import CustomError from '../utils/customeError.js';
import httpError from '../utils/httpError.js';
import httpResponse from '../utils/httpResponse.js';
import crypto from 'crypto';
import { generateNumericOTP } from '../utils/otherUtils.js';
import config from '../config/config.js';
import { Payment } from '../models/paymentModel.js';
import logger from '../utils/logger.js';

export const bookCab = async (req, res, next) => {
    const cashOrderId = `Cash_${generateNumericOTP(9)}`;

    try {
        const {
            bookingType,
            bookedCab,
            exactLocation,
            departureDate,
            dropOffDate,
            pickupLocation,
            destination,
            numberOfPassengers,
            bookingStatus,
            paymentMethod,
            passengers,
            bookingAmount
        } = req.body;

        const userId = req.user._id;
        let razorpayOrderId = '';
        let amountToPay = 0;

        // Calculate the amount to be paid based on payment method
        if (paymentMethod === 'Hybrid') {
            amountToPay = Math.round(bookingAmount * EApplicationEnvironment.HYBRID_PAYMENT_PERCENTAGE * 100); // 10% of booking amount in paise
        } else if (paymentMethod === 'Online') {
            amountToPay = Math.round(bookingAmount * 100); // Full amount in paise
        }

        // Create a Razorpay order if needed
        if (paymentMethod === 'Hybrid' || paymentMethod === 'Online') {
            const options = {
                amount: amountToPay,
                currency: 'INR',
                receipt: `order_${new Date().getTime()}`
            };
            const razorpayOrder = await razorpayInstance.orders.create(options);
            razorpayOrderId = razorpayOrder.id;
        } else if (paymentMethod === 'Cash') {
            razorpayOrderId = cashOrderId;
        }

        // Determine order expiration date
        const expireMinutes = EApplicationEnvironment.ORDER_EXPIRE_MINUTES || 15; // Default to 15 minutes if not set
        const orderExpireDate = paymentMethod === 'Cash' ? null : new Date(Date.now() + expireMinutes * 60 * 1000);

        // Prepare order options
        const orderOptions = {
            userId,
            bookingType,
            bookedCab,
            exactLocation,
            departureDate,
            dropOffDate,
            pickupLocation,
            destination,
            numberOfPassengers,
            bookingStatus,
            paymentMethod,
            paymentStatus: 'Pending',
            passengers,
            bookingAmount,
            paidAmount: 0, // Initialize as 0, update after successful payment
            razorpayOrderId,
            order_expire: orderExpireDate
        };

        // Remove outdated cache entries
        await delCache(['pending_orders', 'all_bookings']);

        // Create the order
        let order;
        if (paymentMethod === 'Hybrid' || paymentMethod === 'Online') {
            order = await Order.create(orderOptions);
        } else if (paymentMethod === 'Cash') {
            order = await Order.create({ ...orderOptions, order_expire: null });
        }

        // Send response
        httpResponse(req, res, 201, responseMessage.ORDER_CREATED, { order, amountToPay: amountToPay / 100, razorpayOrderId }, null);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

// export const paymentVerification = async (req, res ,next) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   try {
//     const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
//     if (!order) {
//       throw new CustomError(responseMessage.ORDER_NOT_FOUND,404);
//     }

//     const hmac = crypto.createHmac('sha256', config.RAZORPAY_API_SECRET);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);

//     const expectedSignature = hmac.digest('hex');
//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (isAuthentic) {
//       await Payment.create({
//         order: order._id,
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature,
//       });

//       if (order.paymentMethod === 'Hybrid') {
//         order.paidAmount = Math.round(order.bookingAmount * 0.1);
//         order.paymentStatus = 'Partially-Paid';
//         order.order_expire = null;
//       } else if (order.paymentMethod === 'Online') {
//         order.paidAmount = order.bookingAmount;
//         order.paymentStatus = 'Paid';
//         order.order_expire = null;
//       }
//       await order.save();

//       httpResponse(req,res,200,responseMessage.PAYMENT_VERIFIED,order,null)
//     } else {

//       throw new CustomError(responseMessage.PAYMENT_VERIFICATION_FAIL,400)
//     }
//   } catch (error) {
//     httpError(next,error,req,500)
//   }
// };

export const paymentVerification = async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        // Log the start of the verification process
        logger.info(`Verifying payment for order ID: ${razorpay_order_id}, payment ID: ${razorpay_payment_id}`);

        // Find the corresponding order in the database
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            throw new CustomError(responseMessage.ORDER_NOT_FOUND, 404);
        }

        // Verify if payment already exists (Idempotency check)
        const paymentExists = await Payment.findOne({ razorpay_payment_id });
        if (paymentExists) {
            httpResponse(req, res, 200, 'Payment already verified', order, null);
            return;
        }

        // Create HMAC to verify the signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET || config.RAZORPAY_API_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const expectedSignature = hmac.digest('hex');

        // Use timingSafeEqual to prevent timing attacks
        const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf-8');
        const razorpaySignatureBuffer = Buffer.from(razorpay_signature, 'utf-8');
        const isAuthentic = crypto.timingSafeEqual(expectedSignatureBuffer, razorpaySignatureBuffer);

        // Check if the payment is authentic
        if (isAuthentic) {
            // Start a database session for transaction
            const session = await Order.startSession();
            session.startTransaction();

            try {
                // Create payment record
                await Payment.create(
                    [
                        {
                            order: order._id,
                            razorpay_order_id,
                            razorpay_payment_id,
                            razorpay_signature
                        }
                    ],
                    { session }
                );

                // Update the order payment status based on payment method
                if (order.paymentMethod === 'Hybrid') {
                    order.paidAmount = Math.round(order.bookingAmount * EApplicationEnvironment.HYBRID_PAYMENT_PERCENTAGE); // 10% paid in Hybrid
                    order.paymentStatus = 'Partially-Paid';
                    order.order_expire = null; // Remove expiry for partially paid orders
                } else if (order.paymentMethod === 'Online') {
                    order.paidAmount = order.bookingAmount; // Full payment
                    order.paymentStatus = 'Paid';
                    order.order_expire = null; // No expiry for fully paid orders
                }

                // Save the updated order within the transaction
                await order.save({ session });

                // Commit the transaction
                await session.commitTransaction();
                session.endSession();

                // Respond with success
                httpResponse(req, res, 200, responseMessage.PAYMENT_VERIFIED, { order, paymentId: razorpay_payment_id }, null);
            } catch (error) {
                // Abort the transaction in case of any error
                await session.abortTransaction();
                session.endSession();
                logger.error(`Transaction failed for order ID: ${razorpay_order_id}`, error);
                httpError(next, error, req, 500);
            }
        } else {
            throw new CustomError(responseMessage.PAYMENT_VERIFICATION_FAIL(razorpay_order_id), 400);
        }
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

export const getMyBookings = async (req, res, next) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).populate({ path: 'userId', select: 'name' }).select('-__v').sort({ createdAt: -1 });

        if (!orders) {
            throw new CustomError(responseMessage.ORDER_NOT_FOUND, 404);
        }
        const leanOrders = orders.map((order) => order.toObject());

        httpResponse(req, res, 200, responseMessage.SUCCESS, leanOrders, null);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

export const getOrderDetail = async (req, res, next) => {
    const cacheKey = `order_${req.params.id}`;
    try {
        const cachedOrder = getCache(cacheKey);
        if (cachedOrder) {
            return httpResponse(req, res, 200, responseMessage.CACHE_SUCCESS, cachedOrder, null);
        }

        const order = await Order.findById(req.params.id).lean();
        if (!order) {
            throw new CustomError(responseMessage.ORDER_NOT_FOUND, 404);
        }
        setCache(cacheKey, order, 600);
        httpResponse(req, res, 200, responseMessage.SUCCESS, order, null);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

export const getAllPendingOrder = async (req, res, next) => {
    const cacheKey = 'pending_orders';
    try {
        if (req.user.role !== 'Driver' && req.user.role !== 'Admin') {
            throw new CustomError(responseMessage.UNAUTHORIZED_ACCESS, 403);
        }

        const cachedPendingOrder = getCache(cacheKey);

        if (cachedPendingOrder) {
            return httpResponse(req, res, 200, responseMessage.CACHE_SUCCESS, cachedPendingOrder, null);
        }

        const orders = await Order.find({ bookingStatus: 'Pending' }).select('-_v');
        if (orders.length === 0) {
            throw new CustomError(responseMessage.ORDER_NOT_FOUND, 404);
        }

        // Cache the result for 10 minutes (600 seconds)
        setCache(cacheKey, orders, 600);
        httpResponse(req, res, 200, responseMessage.SUCCESS, orders, null);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};
