import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

export default {
    // General
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    DB_URI: process.env.DATABASE_URI,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
}
