// @ts-nocheck
import mongoose from 'mongoose'
import logger from '../utils/logger.js'
import CustomError from '../utils/customeError.js'

const imageSchema = new mongoose.Schema({
    public_id: { type: String, required: true },
    url: { type: String, required: true }
})

const bookingSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.ObjectId, ref: 'Order', required: true },
    departureDate: { type: Date },
    dropOffDate: { type: Date },
    accepted: { type: Boolean, default: false },
    status: { type: String, enum: ['Upcoming', 'Past', 'Cancelled'], default: 'Upcoming' }
})

const cabSchema = new mongoose.Schema({
    modelName: { type: String, required: true },
    capacity: { type: Number, required: true },
    feature: { type: String, enum: ['AC', 'NON/AC'] },
    belongsTo: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    photos: [imageSchema],
    cabNumber: { type: String, required: true },
    availability: { type: String, enum: ['Available', 'Booked'], default: 'Available' },
    rate: { type: Number, default: 0 },
    isReady: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    upcomingBookings: [bookingSchema]
})

cabSchema.methods.updateUpcomingBookings = function () {
    const now = new Date()
    this.upcomingBookings = this.upcomingBookings.filter((booking) => {
        if (booking.departureDate > now) {
            return true
        }
        booking.status = 'Past'
        return false
    })
}

cabSchema.methods.addBooking = async function (orderId, departureDate, dropOffDate) {
    try {
        const newBooking = { orderId, departureDate, dropOffDate, status: 'Upcoming' }
        this.upcomingBookings.push(newBooking)
        this.updateUpcomingBookings()
        await this.save()
    } catch (error) {
        logger.error('Error adding booking:', { meta: { error: error } })
        throw new CustomError('Could not add booking', 500)
    }
}

cabSchema.methods.removeBooking = async function (orderId, session = null) {
    const options = session ? { session } : {}

    try {
        // Filter out the booking to be removed
        const updatedUpcomingBookings = this.upcomingBookings.filter((booking) => booking.orderId.toString() !== orderId.toString())

        // Use findOneAndUpdate to perform an atomic update
        const updatedCab = await this.constructor.findOneAndUpdate(
            { _id: this._id },
            {
                $set: {
                    upcomingBookings: updatedUpcomingBookings
                }
            },
            { new: true, ...options }
        )

        if (!updatedCab) {
            logger.error('Cab not found or update failed:', { meta: { cabId: this._id, orderId } })
            return false
        }

        // Update the current document with the new data
        this.upcomingBookings = updatedCab.upcomingBookings

        return true
    } catch (error) {
        logger.error('Error removing booking:', { meta: { error: error, cabId: this._id, orderId } })
        return false
    }
}

cabSchema.pre('save', function (next) {
    this.updateUpcomingBookings()
    next()
})

cabSchema.index({ capacity: 1, 'upcomingBookings.departureDate': 1 })

export const Cab = mongoose.model('Cab', cabSchema)
