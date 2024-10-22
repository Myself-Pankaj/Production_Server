export default {
    // 2xx: Success
    // General Success
    OPERATION_SUCCESS: '✅ Success! Your request was completed without a hitch.', // 200
    CACHE_UPDATE_SUCCESS: '✅ Cache updated successfully. Data is now up to date.', // 200
    SOMETHING_WENT_WRONG: 'Opps! Something went wrong',

    // Authentication Success
    LOGIN_SUCCESS: '👋 Welcome back! You’ve logged in successfully.', // 200
    LOGOUT_SUCCESS: '👋 You’ve logged out. We look forward to seeing you again.', // 200
    PROFILE_UPDATE_SUCCESS: '🔄 Profile updated successfully. You’re all set!', // 200
    PASSWORD_CHANGE_SUCCESS: '🔐 Password changed. Security first!', // 200
    PASSWORD_RESET_SUCCESS: '🔑 Password reset successfully. Welcome back!', // 200
    ACCOUNT_VERIFIED: '🎉 Your account has been verified! Let’s get started.', // 200

    // Email Success
    EMAIL_SENT_SUCCESS: (email) => `📧 Email sent to ${email}. Please check your inbox.`, // 200
    PASSWORD_RESET_EMAIL_SUBJECT: (username) => `🔒 Password reset completed for ${username}.`, // 200
    ACCOUNT_VERIFICATION_EMAIL_SUBJECT: (name) => `🎉 Verification complete, ${name}! Your account is now live.`, // 200
    VERIFY_ACCOUNT_EMAIL_SUBJECT: '🔑 Action Required: Verify Your Account',
    DRIVER_ASSIGNMENT_EMAIL_SUBJECT: '🔄 Got a new Booking.Kindly accept the booking',
    PAYOUT_EMAIL_SUBJECT: (id) => `Payout for Order ID ${id}`,
    DRIVER_VERIFICATION_EMAIL_SUBJECT: '📄 Documents verification completed',
    VERIFY_ACCOUNT_EMAIL_BODY: '🔒 Use the OTP provided to complete your account verification.',
    PASSWORD_RESET_EMAIL_BODY: '🔒 Your password has been successfully reset.',
    CAB_REGISTRATION_EMAIL_SUBJECT: '✅ Cab register successfully with us !',
    BOOKING_CONFIRMED_EMAIL_SUBJECT: '✅ Booking confirirmed successfully',
    ORDER_CREATION_EMAIL_SUBJECT: '✅ Your Booking is Confirmed! ',
    // Email Errors
    EMAIL_SENDING_FAILED: (email) => `❌ Failed to send email to ${email}. Please try again later.`, // 500

    // Token Success
    TOKEN_CREATED_SUCCESS: (userId) => `🔑 Token generated for user: ${userId}.`, // 200

    // 4xx: Client Errors
    // General Errors
    UNAUTHORIZED_ACCESS: '⚠️ Permission Denied',
    INVALID_REQUEST: '⚠️ Invalid request. Please review and try again.', // 400
    RESOURCE_NOT_FOUND: (entity) => `🔍 ${entity} not found. Please check and try again.`, // 404
    INVALID_INPUT_DATA: '⚠️ Invalid input data. Verify and resubmit.', // 400

    //images
    UPLOADING_ERROR: '⚠️ Cannot able to upload your images',
    // Authentication Errors
    USER_ALREADY_REGISTERED: '🔒 This account is already registered. Please log in.', // 409
    AUTHENTICATION_FAILED: '🚫 Incorrect email or password. Please try again.', // 401
    LOGIN_REQUIRED: '🔐 You need to log in to access this feature.', // 401
    OLD_PASSWORD_INCORRECT: '❌ The provided old password is incorrect.', // 400
    TOKEN_INVALID: '❌ Invalid token. Please log in again.', // 401
    TOKEN_EXPIRED: '⌛ Token expired. Please log in again.', // 401

    // OTP Errors
    OTP_INCORRECT: (attempts) => `❗ Incorrect OTP. You have ${attempts} attempts left.`, // 400
    OTP_EXPIRED: '⌛ OTP expired. Request a new one.', // 400
    OTP_TOO_MANY_ATTEMPTS: '🚫 Too many incorrect OTP attempts. Please try again later.', // 429

    // 5xx: Server Errors
    SERVER_FAILURE: '❌ Server encountered an error. Please try again later.', // 500
    PROFILE_UPDATE_ERROR: '❌ Could not update profile. Please try again.', // 500
    PASSWORD_RESET_ERROR: '❌ Password reset failed. Please try again later.', // 500
    USER_REGISTRATION_ERROR: '❌ Could not register user. Please try again.', // 500
    LOGIN_FAILURE: '❌ Login attempt failed. Please try again later.', // 500

    // Cab-related Success & Errors
    CAB_REGISTRATION_FAIL: '🚗 Registation failed',
    CAB_REGISTRATION_SUCCESS: '🚗 Cab successfully registered.', // 200
    CAB_UPDATE_SUCCESS: '🚗 Cab details updated successfully.', // 200
    CAB_DELETION_SUCCESS: '🚗 Cab removed from the system.', // 200

    CAB_RATE_SUCCESS: '🚗 Cab rate successfully updated.', // 200
    CAB_ASSIGN_SUCCESS: '🚗 Cab assigned successfully',

    // Driver-related Messages
    DOCUMENT_UPLOAD_SUCCESS: '📄 Documents uploaded successfully.', // 200
    DOCUMENT_UPLOAD_FAILURE: '❌ Document upload failed. Please try again.', // 500
    INVALID_DOCUMENT_FORMAT: '⚠️ Unsupported file format. Only JPEG, PNG, and PDF are allowed.', // 400
    DOCUMENT_TOO_LARGE: '⚠️ Document size exceeds the maximum limit of 5MB.', // 400
    INVALID_BANK_DETAILS: '⚠️ Invalid bank details',
    MISSING_BANK_DETAILS: '⚠️ Bank details are missing',
    VERIFICATION_COMPLETE: 'Driver is verified and now we can assign bookings to this driver.',
    VERIFICATION_REVOKED: 'Driver verification has been revoked.',

    // Order-related Messages
    ORDER_CREATION_SUCCESS: '📅 Booking successfully created.', // 200
    ORDER_NOT_FOUND_ERROR: '📅 Booking could not be found.', // 404
    PAYMENT_VERIFICATION_SUCCESS: '💳 Payment successfully verified.', // 200
    PAYMENT_VERIFICATION_FAILURE: (orderId) =>
        `Payment verification failed for order ${orderId}. If charged, your amount will be refunded within 2-3 business days.`, // 500

    // Rate Limiting
    TOO_MANY_REQUESTS_ERROR: '🚫 Too many requests in a short time. Please slow down and try again later.', // 429
    BOOKING_NOT_COMPLETED: '📅 Booking is not completed.'
}
