import httpResponse from '../utils/httpResopnse.js'
import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'
// import quicker from '../utils/quickUtils';

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}
