import express from 'express'
import path from 'path'
import router from './src/routes/apiRoute.js'
import globalErrorHandler from './src/middlewares/globalErrorHandler.js'
import httpError from './src/utils/httpError.js'
import responseMessage from './src/constants/responseMessage.js'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import corsOptions from './src/middlewares/corsMiddleware.js'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

//Routes
import userRoute from './src/routes/userApiRoutes.js'
import cabRoute from './src/routes/cabApiRoutes.js'
import driverRoute from './src/routes/driverApiRoutes.js'
import orderRoute from './src/routes/orderApiRoutes.js'
import adminRoute from './src/routes/adminApiRoutes.js'
import config from './src/config/config.js'
import { EApplicationEnvironment } from './src/constants/application.js'
import session from 'express-session'
import MongoStore from 'connect-mongo'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

//Middleware
app.use(helmet())

app.use(corsOptions)

app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
        useTempFiles: true
    })
)
app.use(express.static(path.join(__dirname, 'public')))
//Not using Session for now as implemented JWT //

app.use(
    session({
        store: MongoStore.create({
            mongoUrl: config.DB_URI, // MongoDB connection URL
            ttl: 14 * 24 * 60 * 60 // Sessions expire in 14 days
        }),
        secret: config.SESSION_SECRET || 'temporary',
        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 2, // 1000ms * 60s * 60min * 2hrs
            secure: config.ENV === EApplicationEnvironment.DEVELOPMENT ? false : true,
            httpOnly: config.ENV === EApplicationEnvironment.DEVELOPMENT ? false : true,
            sameSite: config.ENV === EApplicationEnvironment.DEVELOPMENT ? false : 'none'
        }
    })
)

app.use('/api/v1', router)
app.use('/api/v1', userRoute)
app.use('/api/v1', cabRoute)
app.use('/api/v1', driverRoute)
app.use('/api/v1', orderRoute)
app.use('/api/v1', adminRoute)

// 404 Error handler
app.use((req, res, next) => {
    try {
        throw new Error(responseMessage.RESOURCE_NOT_FOUND('Route'))
    } catch (err) {
        httpError('404', next, err, req, 404)
    }
})

app.use(globalErrorHandler)

export default app
