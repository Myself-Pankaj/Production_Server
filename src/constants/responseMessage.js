export default {
    // 2xx: Success
    // General Success
    SUCCESS: '🎉 All done! Your request was a success.', // 200
    CACHE_SUCCESS: '🎉 All set! Your request was a success.', // 200

    // Authentication Success
    LOGIN_SUCCESS: '🎉 Welcome back! You’ve successfully logged in.', // 200
    LOGOUT_SUCCESS: '👋 Logged out successfully. See you next time!', // 200
    PROFILE_UPDATE_SUCCESS: '✅ Profile updated! Looking sharp.', // 200
    PASSWORD_UPDATE_SUCCESS: '🎉 Password updated successfully. Stay secure!', // 200
    PASSWORD_RESET_SUCCESS: '🎉 Password reset successfully. Welcome back!', // 200
    ACCOUNT_VERIFICATION_SUCCESS: '🎉 Account successfully verified! Welcome aboard.', // 200

    // Email Success
    EMAIL_SEND_SUCCESS: (mailId) => `✉️ Success! Email sent to ${mailId}. Check your inbox.`, // 200
    PASSWORD_RESET_SUCCESS_EMAIL_SUBJECT: (username) => `🔒 Password reset successful, ${username}!`, // 200
    ACCOUNT_VERIFICATION_SUCCESS_EMAIL_SUBJECT: (name) => `🎉 Congrats, ${name}! Your account is verified.`, // 200

    // Reusable Success Messages
    TOKEN_SUCCESS: (hashedId) => `🔑 Token created for user: ${hashedId}. All set!`, // 200
    ACCOUNT_VERIFICATION: '✅ Check your email! An OTP is on its way to verify your account.', // 200

    // 4xx: Client Errors
    // General Errors
    SOMETHING_WENT_WRONG: '⚠️ Uh-oh! Something went off course. Give it another shot.', // 400

    NOT_FOUND: (entity) => `🔍 Oops! Couldn't locate that ${entity}. Let's try something else.`, // 404
    INVALID_FORMAT: '⚠️ Invalid details. Please double-check and try again.', // 400

    // Authentication Errors
    USER_ALREADY_EXIST: '🔒 This user is already registered. Try logging in.', // 409
    INVALID_LOGIN: '🚫 Incorrect email or password. Please try again.', // 401
    ACCOUNT_NOT_FOUND: '🔐 Please login to access this feature.', // 401
    PASSWORD_NOT_MATCHING: '❌ Old password doesn’t match. Please try again.', // 400
    INVALID_TOKEN: '❌ Invalid token. Please login again.', // 401
    TOKEN_EXPIRED: '⌛ Your token has expired. Please login again.', // 401

    // OTP Errors
    INVALID_OTP_FORMAT: '❗ Invalid or expired OTP. Please enter the correct one.', // 400
    INVALID_OTP: (tries) => `❗ Incorrect OTP. You have ${tries} more tries left.`, // 400
    OTP_EXPIRE: '⌛ Oops! Your OTP expired. Please sign up again.', // 400
    MAX_OTP_ATTEMPTS_EXCEEDED: '🚫 Too many failed attempts. Please wait 5 minutes before trying again.', // 429

    // Email Errors
    EMAIL_SEND_FAIL: (mailId) => `❌ Uh-oh! We couldn’t send an email to ${mailId}. Try again later.`, // 500
    FORGET_PASSWORD_EMAIL_FAIL: '❌ Couldn’t send the reset email. Please try again later.', // 500

    // Reusable Client Errors
    USER_NOT_FOUND: '⚠️ User not found. Please check your details and try again.', // 404
    ALREADY_VERIFIED: '✅ This account is already verified. You’re good to go!', // 409
    INVALID_EMAIL: '❗ No user found with that email. Please check and try again.', // 404
    OTP_EXPIRED: '⌛ OTP expired. Please sign up again.', // 400

    // 5xx: Server Errors

    PROFILE_UPDATE_FAIL: '❌ Profile update eRROR:', // 500
    PASSWORD_RESET_FAIL: '❌ Password reset eRROR:', // 500
    USER_REGISTRATION_FAIL: '❌rEGISTRATION ERROR:',
    ACCOUNT_VERIFICATION_FAIL: '❌ Verification ERROR:', // 400
    LOGIN_FAIL: '❌LOGIN ERROR:',
    LOGOUT_FAIL: '❌ LOGOUT ERROR:', // 500
    FORGET_PASSWORD_FAIL: '❌ FORGET PASSWORD ERROR:', // 500
    CAR_REGISTRATION_FAIL: '❌ CAB REGISTRATION ERROR:',
    UPLOADING_ERROR: '❌ IMAGE UPLOADING ERROR:',
    CAR_UPDATE_FAIL: '❌ CabUpdate ERROR:',
    RATE_DEFINED_CABS: '❌ rATE DEFINED CABS ERROR:',
    CAB_DELETE_FAIL: '❌ CAB DELTETION FAIL:',
    // Rate Limiting
    TOO_MANY_REQUESTS: '🚫 Whoa, slow down! You’re making requests too quickly. Take a breather.', // 429

    // Email Content
    ACCOUNT_VERIFICATION_EMAIL_SUBJECT: '🔑 Verify Your Account - Here’s Your OTP',
    ACCOUNT_VERIFICATION_EMAIL_CLOSURE: '🔒 Keep it safe! This OTP is for login purposes only.',
    EMAIL_CLOSURE: '🔒 This OTP is secure and valid for 5 minutes only.', // Reusable for all OTP emails
    FORGET_PASSWORD_EMAIL_SUBJECT: '🔑 Reset Your Password',
    PASSWORD_CHANGE_EMAIL_SUBJECT: '🔒 Password Update Alert',
    PASSWORD_RESET_CLOSURE: `🔒 Your password is secure. You're all set!`,
    CAB_REGISTRATION_EMAIL_SUBJECT: `🎉 New Car registered`,

    //cab Model
    UNAUTHORIZED_ACCESS: '❌ Access denied.',
    MISSING_DETAILS: '❌ kINDLY PROVIDE ALL THE NECESSARY DETAILS.',
    CAR_REGISTRATION_SUCCESS: 'Car registration success',

    CAR_UPDATE_SUCCESS: 'Cab updated Successfully',
    CAB_NOT_FOUND: 'Cab Not Found ',
    CAB_DELETE_SUCCESS: 'Cab Deleted Successfully'
}
