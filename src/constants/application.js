import config from '../config/config.js'

export const EApplicationEnvironment = {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
    HYBRID_PAYMENT_PERCENTAGE: parseFloat(config.HYBRID_PAYMENT_PERCENTAGE) || 0.1,
    ORDER_EXPIRE_MINUTES: parseInt(config.ORDER_EXPIRE, 10) || 5,
    SITE_NAME: 'XYZ', //TODO add a site name
    SITE_EMAIL: 'ABX&gmail.com' //TODO add a site email
}
