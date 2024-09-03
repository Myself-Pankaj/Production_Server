import config from '../config/config.js'
import { EApplicationEnvironment } from '../constants/application.js'
import { rateLimiterMongo } from '../config/rateLimiter.js'
import httpError from '../utils/httpError.js'
import responseMessage from '../constants/responseMessage.js'

export default (req, res, next) => {
    if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
        return next()
    }

    if (rateLimiterMongo) {
        rateLimiterMongo
            .consume(req.ip, 1)
            .then(() => {
                next()
            })
            .catch(() => {
                httpError(next, new Error(responseMessage.TOO_MANY_REQUESTS), req, 429)
            })
    }
}
