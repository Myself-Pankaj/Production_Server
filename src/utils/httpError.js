import errorObject from './errorHandler.js'

export default (controller, nextFunc, err, req, errorStatusCode = 500) => {
    const errorObj = errorObject(controller, err, req, errorStatusCode)
    return nextFunc(errorObj)
}
