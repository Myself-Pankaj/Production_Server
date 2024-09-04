import httpResponse from '../utils/httpResponse.js'
import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'
import { getApplicationHealth, getSystemHealth } from '../utils/quicker.js'

export default {
    self: (req, res, next) => {
        try {
            const token = 'Token'
            httpResponse(req, res, 200, responseMessage.SUCCESS, null, token)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    health: (req, res, next) => {
        try {
            const healthData = {
                application: getApplicationHealth(),
                system: getSystemHealth(),
                timestamp: Date.now()
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, healthData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}
