import errorObject from './errorHandler.js'

export default (nextFunc, err, req, errorStatusCode = 500) => {
    const errorObj = errorObject(err, req, errorStatusCode)
    return nextFunc(errorObj)
}
