import express from 'express'
import path from 'path'

import router from './src/routes/apiRoute.js'
import globalErrorHandler from './src/middlewares/globalErrorHandler.js'
import httpError from './src/utils/httpError.js'
import responseMessage from './src/constants/responseMessage.js'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
const app = express()
app.use(helmet())
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.json({ limit: '50mb' }))

app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/v1', router)

// 404 Error handler
app.use((req, res, next) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('route'))
    } catch (err) {
        httpError(next, err, req, 404)
    }
})

app.use(globalErrorHandler)

export default app
