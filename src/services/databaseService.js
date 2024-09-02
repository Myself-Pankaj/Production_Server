import mongoose from 'mongoose'
import config from '../config/config.js'

export default {
    connect: async () => {
        try {
            await mongoose.connect(config.DB_URI)
            return mongoose.connection
        } catch (err) {
            throw err
        }
    }
}