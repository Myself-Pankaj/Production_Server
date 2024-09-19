import axios from 'axios'
import config from '../config/config.js'
import CustomError from '../utils/customeError.js'
import logger from '../utils/logger.js'
import { EApplicationEnvironment } from '../constants/application.js'
//TODO After adding site name add here

export const setupRazorpayAccount = async (user, orderId) => {
    try {
        // Step 1: Create Contact
        const contactData = {
            name: user.username,
            email: user.email,
            contact: user.phoneNumber,
            type: 'Drivers',
            reference_id: user._id,
            notes: {
                notes_key_1: `Payout for ${orderId}`
            }
        }
        const contactResponse = await makeRazorpayRequest('contacts', contactData)

        // console.log('Contact created:', contactResponse);
        logger.info(`ContactId Creted Successfully `, { meta: { contactId: contactResponse } })
        // Step 2: Create Fund Account
        const fundAccountData = {
            contact_id: contactResponse.id,
            account_type: 'bank_account',
            bank_account: {
                name: user.wallet.bankDetails.accountHolderName,
                ifsc: user.wallet.bankDetails.ifsc,
                account_number: user.wallet.bankDetails.accNo
            }
        }

        const fundAccountResponse = await makeRazorpayRequest('fund_accounts', fundAccountData)

        logger.info(`Fund account created Successfully `, { meta: { fundAccount: fundAccountResponse } })
        // Step 3: Validate Fund Account
        const validationData = {
            account_number: config.RAZORPAY_ACCOUNT_NUMBER,
            fund_account: {
                id: fundAccountResponse.id
            },
            amount: 100,
            currency: 'INR',
            notes: {
                Description: 'For account validation ' //TODO After adding site name add here
            }
        }
        const validationResponse = await makeRazorpayRequest('fund_accounts/validations', validationData)

        logger.info(`Fund account validated Successfully `, { meta: { validationResponse: validationResponse } })
        return {
            contactId: contactResponse.id,
            fundAccountId: fundAccountResponse.id,
            validationStatus: validationResponse.status
        }
    } catch (error) {
        throw new CustomError(error.message || 'Failed to setup Razorpay account', 500)
    }
}

const makeRazorpayRequest = async (endpoint, data) => {
    try {
        const response = await axios.post(`https://api.razorpay.com/v1/${endpoint}`, data, {
            auth: {
                username: config.RAZORPAY_API_KEY,
                password: config.RAZORPAY_API_SECRET
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data
    } catch (error) {
        logger.error(`Error in Razorpay API call to ${endpoint}:`, { meta: { error: error.response?.data || error.message } })
        throw new CustomError(error.response?.data?.error?.description || error.message, error.response?.status || 500)
    }
}

export const fundTransfer = async (fundAccountId, amount, user, orderId) => {
    try {
        const payoutData = {
            account_number: config.RAZORPAY_ACCOUNT_NUMBER,
            fund_account_id: fundAccountId,
            amount: amount * 100,
            currency: 'INR',
            mode: 'NEFT',
            purpose: 'payout',
            queue_if_low_balance: true,
            reference_id: user._id,
            narration: `From ${EApplicationEnvironment.SITE_NAME}`, //TODO After adding site name add here
            notes: {
                payoutFor: `Payout for ${orderId}`
            }
        }

        const response = await makeRazorpayRequest('payouts', payoutData)

        logger.info(`Fund transfer completed: `, { meta: { data: response } })
        return response
    } catch (error) {
        logger.error(`Error in fundTransfer: `, { meta: { data: error } })

        throw new CustomError(error.message || 'Failed to transfer funds', 500)
    }
}
