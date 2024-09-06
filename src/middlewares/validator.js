import { body } from 'express-validator'

export const validateBooking = [body('paymentMethod').isIn(['Hybrid', 'Online', 'Cash']), body('bookingAmount').isNumeric()]
