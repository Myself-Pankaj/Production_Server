import Razorpay from 'razorpay'
import config from './config'

const razorpayInstance = new Razorpay({
    key_id: config.RAZORPAY_API_KEY,
    key_secret: config.RAZORPAY_API_SECRET
})

export default razorpayInstance
