import responseMessage from '../constants/responseMessage.js'
import config from '../config/config.js'
import { EApplicationEnvironment } from '../constants/application.js'
import logger from './logger.js'

export default (controller, err, req, errorStatusCode = 500) => {
    const errorObj = {
        success: false,
        statusCode: err.statusCode || errorStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl
        },
        message: err instanceof Error ? err.message || responseMessage.SOMETHING_WENT_WRONG : responseMessage.SOMETHING_WENT_WRONG,
        data: null,
        trace: err instanceof Error ? { error: err.stack } : null
    }

    // Log
    logger.error(`${controller} CONTROLLER`, {
        meta: errorObj
    })

    // Production Env check
    if (config.ENV === EApplicationEnvironment.PRODUCTION) {
        delete errorObj.request.ip
        delete errorObj.trace
    }

    return errorObj
}
