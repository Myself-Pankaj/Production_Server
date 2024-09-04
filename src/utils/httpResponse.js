import config from '../config/config.js'
import { EApplicationEnvironment } from '../constants/application.js'
import logger from './logger.js'

export default (req, res, responseStatusCode, responseMessage, data = null, token = null) => {
    const response = {
        success: responseStatusCode < 400 ? true : false,
        statusCode: responseStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl
        },

        message: responseMessage,
        data: data,
        token: token || null
    }

    // Log
    logger.info('CONTROLLER_RESPONSE', {
        meta: response
    })

    // Production Env check
    if (config.ENV === EApplicationEnvironment.PRODUCTION) {
        delete response.request.ip
    }

    res.status(responseStatusCode).json(response)
}

// 1xx Informational
// 100 Continue: The server has received the initial part of the request and the client should proceed with the rest of the request.
// 101 Switching Protocols: The server is switching protocols as requested by the client.
// 2xx Success
// 200 OK: The request was successful, and the response contains the requested data.
// 201 Created: The request was successful, and a new resource was created (e.g., POST request).
// 202 Accepted: The request has been accepted for processing, but the processing has not been completed.
// 203 Non-Authoritative Information: The request was successful, but the returned information may be from a different source.
// 204 No Content: The request was successful, but there is no content to send in the response.
// 205 Reset Content: The request was successful, and the client should reset the document view.
// 206 Partial Content: The server is delivering only part of the resource due to a range header sent by the client.
// 3xx Redirection
// 300 Multiple Choices: There are multiple choices for the resource, and the client must choose one.
// 301 Moved Permanently: The resource has been moved permanently to a new URL.
// 302 Found: The resource is temporarily located at a different URL.
// 303 See Other: The response to the request can be found at another URL using the GET method.
// 304 Not Modified: The resource has not been modified since the last request.
// 305 Use Proxy: The requested resource must be accessed through a proxy.
// 307 Temporary Redirect: The resource is temporarily located at a different URL, and the request method should not be changed.
// 308 Permanent Redirect: The resource has been permanently moved to a new URL, and the request method should not be changed.
// 4xx Client Errors
// 400 Bad Request: The request was invalid or cannot be processed by the server.
// 401 Unauthorized: Authentication is required and has failed or has not been provided.
// 402 Payment Required: Reserved for future use; currently not used.
// 403 Forbidden: The server understands the request but refuses to authorize it.
// 404 Not Found: The requested resource could not be found.
// 405 Method Not Allowed: The method used in the request is not allowed for the resource.
// 406 Not Acceptable: The resource is not available in a format acceptable to the client.
// 407 Proxy Authentication Required: Authentication is required to access the resource through a proxy.
// 408 Request Timeout: The server timed out waiting for the request.
// 409 Conflict: The request could not be completed due to a conflict with the current state of the resource.
// 410 Gone: The resource is no longer available and has been permanently removed.
// 411 Length Required: The server requires the Content-Length header to be present in the request.
// 412 Precondition Failed: One or more preconditions in the request header fields were not met.
// 413 Payload Too Large: The request entity is larger than the server is willing or able to process.
// 414 URI Too Long: The URI provided was too long for the server to process.
// 415 Unsupported Media Type: The media type of the request is not supported by the server.
// 416 Range Not Satisfiable: The requested range cannot be satisfied by the server.
// 417 Expectation Failed: The server cannot meet the requirements of the Expect request-header field.
// 418 I'm a teapot: (RFC 2324) An April Fools' joke; the server refuses to brew coffee because it is a teapot.
// 421 Misdirected Request: The request was directed to a server that is not able to produce a response.
// 422 Unprocessable Entity: The request was well-formed but was unable to be followed due to semantic errors.
// 423 Locked: The resource is locked and cannot be modified.
// 424 Failed Dependency: The request failed due to a previous request's failure.
// 425 Too Early: The server is unwilling to risk processing a request that might be replayed.
// 426 Upgrade Required: The server requires the client to upgrade to a different protocol.
// 428 Precondition Required: The server requires the request to be conditional.
// 429 Too Many Requests: The user has sent too many requests in a given amount of time.
// 431 Request Header Fields Too Large: The server is unwilling to process the request because the header fields are too large.
// 451 Unavailable For Legal Reasons: The resource is unavailable due to legal reasons.
// 5xx Server Errors
// 500 Internal Server Error: The server encountered an unexpected condition that prevented it from fulfilling the request.
// 501 Not Implemented: The server does not support the functionality required to fulfill the request.
// 502 Bad Gateway: The server received an invalid response from an upstream server.
// 503 Service Unavailable: The server is currently unable to handle the request due to temporary overloading or maintenance.
// 504 Gateway Timeout: The server did not receive a timely response from an upstream server.
// 505 HTTP Version Not Supported: The server does not support the HTTP protocol version used in the request.
// 506 Variant Also Negotiates: The server has an internal configuration error where a transparent content negotiation resulted in a circular reference.
// 507 Insufficient Storage: The server cannot store the representation needed to complete the request.
// 508 Loop Detected: The server detected an infinite loop while processing a request.
// 510 Not Extended: Further extensions to the request are required for the server
