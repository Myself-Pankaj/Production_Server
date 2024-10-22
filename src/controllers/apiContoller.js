import httpResponse from '../utils/httpResponse.js'
import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'
import { getApplicationHealth, getSystemHealth } from '../utils/quicker.js'
import CustomError from '../utils/customeError.js'
import config from '../config/config.js'
import logger from '../utils/logger.js'
import axios from 'axios'

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, null, null)
        } catch (err) {
            httpError('SELF', next, err, req, 500)
        }
    },
    health: (req, res, next) => {
        try {
            const healthData = {
                application: getApplicationHealth(),
                system: getSystemHealth(),
                timestamp: Date.now()
            }

            httpResponse(req, res, 200, responseMessage.OPERATION_SUCCESS, healthData)
        } catch (err) {
            httpError('HEALTH', next, err, req, 500)
        }
    },
    calculateDistance: async (req, res, next) => {
        const { origin, destination } = req.query
        // Check if both origin and destination are provided
        if (!origin || !destination) {
            return httpError('CALCULATE DISTANCE', next, new CustomError('Origin and destination are required', 400), req, 400)
        }
        const apiKey = config.GOOGLE_MAPS_API_KEY

        if (!apiKey) {
            logger.error('Google Maps API key is missing from environment variables')
            return httpError('CALCULATE DISTANCE', next, new CustomError('Server configuration error', 500), req, 500)
        }
        try {
            // Call Google Distance Matrix API
            const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                params: {
                    origins: origin,
                    destinations: destination,
                    key: apiKey
                }
            })

            const data = response.data

            // Check if API response is valid and contains data
            if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
                const distance = data.rows[0].elements[0].distance.text
                const duration = data.rows[0].elements[0].duration.text

                httpResponse(req, res, 200, 'Distance and duration calculated successfully', { distance, duration }, null)
            } else {
                // Handle case where Google API responds with non-OK status
                logger.warn('Unable to calculate distance: Invalid API response', { origin, destination, data })
                throw new CustomError('Unable to calculate distance', 400)
            }
        } catch (error) {
            // Handle possible errors (like network issues or invalid API keys)
            httpError('CALCULATE DISTANCE', next, error, req, 500)
        }
    }
}
