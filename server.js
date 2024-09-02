import app from './app.js'
import config from './src/config/config.js'
import databaseService from './src/services/databaseService.js'
import logger from './src/utils/logger.js'

const server = app.listen(config.PORT)
;(async () => {
    try {
        // Connect to the database
        const connection = await databaseService.connect()

        // Log successful database connection
        logger.info('DATABASE CONNECTION = TRUE', {
            meta: { CONNECTION_NAME: connection.name }
        })

        // Log application start
        logger.info('SERVER IS STARTED && HEALTHY = TRUE', {
            meta: { PORT: config.PORT }
        })
    } catch (error) {
        // Log application error
        logger.error('SERVER IS STARTED && HEALTHY != TRUE', { meta: { message: error.message, stack: error.stack } })

        // Attempt to close the server
        server.close((closeError) => {
            if (closeError) {
                // Log server close error
                logger.error('APPLICATION_ERROR', { meta: { message: closeError.message, stack: closeError.stack } })
            }

            // Exit the process with failure status
            process.exit(1)
        })
    }
})()
