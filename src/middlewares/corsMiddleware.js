import cors from 'cors'
import logger from '../utils/logger.js'
import config from '../config/config.js'

// Load environment variables from .env file

const allowedOrigin = config.ALLOWED_ORIGINS || []

const corsOptions = cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true) // Allow non-origin requests (e.g., mobile apps)
        if (origin !== allowedOrigin) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
            logger.warn(`CORS policy violation attempt from origin: ${origin}`)
            return callback(new Error(msg), false)
        }
        return callback(null, true)
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] // Allow these HTTP methods
})

export default corsOptions
