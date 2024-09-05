// @ts-nocheck
import mongoose from 'mongoose'
import logger from '../utils/logger.js'
import CustomError from '../utils/customeError.js'

const imageSchema = new mongoose.Schema({
    public_id: { type: String, required: true },
    url: { type: String, required: true }
})

const bookingSchema = new mongoose.Schema({
    orderId: { type: String },
    departureDate: { type: Date },
    dropOffDate: { type: Date },
    status: { type: String, enum: ['Upcoming', 'Past', 'Cancelled'], default: 'Upcoming' }
})

const cabSchema = new mongoose.Schema({
    modelName: { type: String, required: true },
    type: { type: String },
    capacity: { type: Number, required: true },
    feature: { type: String, enum: ['AC', 'NON/AC'] },
    belongsTo: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    photos: [imageSchema],
    cabNumber: { type: String, required: true },
    availability: { type: String, enum: ['Available', 'Booked'], default: 'Available' },
    rate: { type: Number, default: 0 },
    isReady: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    upcomingBookings: [bookingSchema],
    pastBookings: [bookingSchema]
})

cabSchema.methods.updateUpcomingBookings = function () {
    const now = new Date()
    const pastBookings = []

    this.upcomingBookings = this.upcomingBookings.filter((booking) => {
        if (booking.departureDate <= now) {
            booking.status = 'Past'
            pastBookings.push(booking)
            return false
        }
        return true
    })

    this.pastBookings.push(...pastBookings)
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

cabSchema.methods.removeBooking = async function (orderId) {
    try {
        this.upcomingBookings = this.upcomingBookings.filter((booking) => booking.orderId !== orderId)
        this.pastBookings = this.pastBookings.filter((booking) => booking.orderId !== orderId)
        await this.save()
    } catch (error) {
        logger.error('Error removing booking:', { meta: { error: error } })
        throw new CustomError('Could not remove booking', 500)
    }
}

export const Cab = mongoose.model('Cab', cabSchema)
