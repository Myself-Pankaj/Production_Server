import { EApplicationEnvironment } from './application.js'

export default {
    // Email templates for user-related notifications

    /**
     * Registration Email with OTP
     * @param {string} username - User's name
     * @param {number} otp - One-time password for verification
     */
    REGISTRATION_EMAIL: (username, otp) => `<html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #0073e6;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 20px;
          }
          h2 {
            font-size: 20px;
            color: #0073e6;
            margin-bottom: 10px;
          }
          p {
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .otp {
            background-color: #0073e6;
            color: #ffffff;
            padding: 10px;
            font-size: 22px;
            font-weight: bold;
            text-align: center;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f1f1f1;
            color: #777777;
            border-radius: 0 0 8px 8px;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
          }
          a {
            color: #0073e6;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${EApplicationEnvironment.SITE_NAME}</h1>
          </div>
          <div class="content">
            <h2>Verify Your Account</h2>
            <p>Hello ${username},</p>
            <p>Thank you for registering with us! Please use the following One-Time Password (OTP) to verify your account:</p>
            <div class="otp">${otp}</div>
            <p>This OTP is valid for 5 minutes. Please complete your verification process within this time frame.</p>
            <p>If you did not request this, please disregard this email or contact our support team.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>Your App Team</p>
            <p>For support, contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a></p>
          </div>
        </div>
      </body>
    </html>`,

    /**
     * Verification Success Email
     * @param {string} username - User's name
     */
    VERIFICATION_SUCCESS_EMAIL: (username) => `<html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              color: #333333;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background-color: #28a745;
              color: #ffffff;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 20px;
            }
            h2 {
              font-size: 20px;
              color: #28a745;
              margin-bottom: 10px;
            }
            p {
              line-height: 1.6;
              margin-bottom: 15px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background-color: #f1f1f1;
              color: #777777;
              border-radius: 0 0 8px 8px;
            }
            .footer p {
              margin: 0;
              font-size: 14px;
            }
            a {
              color: #28a745;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${EApplicationEnvironment.SITE_NAME}</h1>
            </div>
            <div class="content">
              <h2>Account Verification Successful</h2>
              <p>Hello ${username},</p>
              <p>We're excited to let you know that your account has been successfully verified. You're all set to explore our services!</p>
              <p>If you have any questions or need assistance, feel free to reach out to us.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>Your App Team</p>
              <p>For support, contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a></p>
            </div>
          </div>
        </body>
    </html>`,

    /**
     * Password Update Success Email
     * @param {string} username - User's name
     */
    PASSWORD_UPDATE_SUCCESS_EMAIL: (username) => `<html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #ffc107;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 20px;
          }
          h2 {
            font-size: 20px;
            color: #ffc107;
            margin-bottom: 10px;
          }
          p {
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f1f1f1;
            color: #777777;
            border-radius: 0 0 8px 8px;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
          }
          a {
            color: #ffc107;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${EApplicationEnvironment.SITE_NAME}</h1>
          </div>
          <div class="content">
            <h2>Password Update Notification</h2>
            <p>Hello ${username},</p>
            <p>This is a confirmation that your password has been successfully updated. If this action was not initiated by you, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>Your App Team</p>
            <p>For support, contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a></p>
          </div>
        </div>
      </body>
    </html>`,
    /**
     * Forgot Password Email with OTP
     * @param {string} username - User's name
     * @param {number} otp - One-time password for resetting the password
     */
    FORGOT_PASSWORD_EMAIL: (username, otp) => `<html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              color: #333333;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background-color: #dc3545;
              color: #ffffff;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 20px;
            }
            h2 {
              font-size: 20px;
              color: #dc3545;
              margin-bottom: 10px;
            }
            p {
              line-height: 1.6;
              margin-bottom: 15px;
            }
            .otp {
              background-color: #dc3545;
              color: #ffffff;
              padding: 10px;
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              border-radius: 4px;
              margin: 20px 0;
              letter-spacing: 2px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              background-color: #f1f1f1;
              color: #777777;
              border-radius: 0 0 8px 8px;
            }
            .footer p {
              margin: 0;
              font-size: 14px;
            }
            a {
              color: #dc3545;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${EApplicationEnvironment.SITE_NAME}</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${username},</p>
              <p>We received a request to reset your password. Use the OTP below to reset it:</p>
              <div class="otp">${otp}</div>
              <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>Your App Team</p>
              <p>For support, contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a></p>
            </div>
          </div>
        </body>
    </html>`,
    /**
     * Forgot Password Email with OTP
     * @param {string} username - User's name
     */
    CAB_REGISTRATION_SUCCESS_EMAIL: (username) => `<html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #ffc107;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 20px;
          }
          h2 {
            font-size: 20px;
            color: #ffc107;
            margin-bottom: 10px;
          }
          p {
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f1f1f1;
            color: #777777;
            border-radius: 0 0 8px 8px;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
          }
          a {
            color: #ffc107;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your App</h1>
          </div>
          <div class="content">
            <h2>Car Registration Success</h2>
            <p>Hello ${username},</p>
            <p>This is a confirmation that your car has been registered successfully. If this action was not initiated by you, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>Your App Team</p>
            <p>For support, contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a></p>
          </div>
        </div>
      </body>
    </html>`,

    /**
     * Forgot Password Email with OTP
     * @param {string} username - User's name
     */
    BOOKING_CONFIRMED_EMAIL: (username) => `<html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #ffc107;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 20px;
          }
          h2 {
            font-size: 20px;
            color: #ffc107;
            margin-bottom: 10px;
          }
          p {
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f1f1f1;
            color: #777777;
            border-radius: 0 0 8px 8px;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
          }
          a {
            color: #ffc107;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your App</h1>
          </div>
          <div class="content">
            <h2>Car Registration Success</h2>
            <p>Hello ${username},</p>
            <p>This is a confirmation that your car has been registered successfully. If this action was not initiated by you, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>Your App Team</p>
            <p>For support, contact us at <a href="mailto:support@yourapp.com">support@yourapp.com</a></p>
          </div>
        </div>
      </body>
    </html>`,

    /**
     * Forgot Password Email with OTP
     * @param {string} username - User's name
     * @param {string} date - date
     * @param {string} pickup - location
     * @param {string} dropoff - date
     * @param {number} amount - total amt
     * @param {string} paymentMethod - pay method
     * @param {number} paidAmount - paid amount
     * @param {string} orderId - paid amount
     */
    ORDER_CREATION_SUCCESS_EMAIL: (username, orderId, date, pickup, dropoff, paymentMethod, paidAmount, amount) => `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .content {
            padding: 20px;
            text-align: left;
          }
          h2 {
            font-size: 22px;
            color: #007bff;
            margin-bottom: 20px;
            text-align: center;
          }
          p {
            line-height: 1.7;
            font-size: 16px;
            margin-bottom: 15px;
          }
          .details {
            background-color: #f1f1f1;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .details p {
            margin: 5px 0;
            font-size: 16px;
          }
          .details p strong {
            color: #007bff;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f9f9f9;
            color: #777777;
            border-radius: 0 0 8px 8px;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
          }
          a {
            color: #007bff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${EApplicationEnvironment.SITE_NAME}</h1>
          </div>
          <div class="content">
            <h2>Booking Confirmation</h2>
            <p>Dear ${username},</p>
            <p>We are thrilled to confirm your booking, scheduled for <strong>${date}</strong> with Booking Id <strong>${orderId}</strong>. Here are the details of your trip:</p>
            <div class="details">
              <p><strong>Pickup Location:</strong> ${pickup}</p>
              <p><strong>Dropoff Location:</strong> ${dropoff}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Paid Amount:</strong> rs.${paidAmount}</p>
              <p><strong>Total Amount:</strong> Rs.${amount}</p>
            </div>
            <p>Should you need to make any changes to your booking or if you have any questions, feel free to reach out to our support team at any time.</p>
            <p>Thank you for choosing our service. We look forward to providing you with a seamless experience!</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The ${EApplicationEnvironment.SITE_NAME} Team</p>
            <p>For support, contact us at <a href="${EApplicationEnvironment.SITE_EMAIL}">support@yourapp.com</a></p>
          </div>
        </div>
      </body>
    </html>
    `,
    /**
     * New Booking Assignment Email
     * @param {string} driverName - Driver's name
     * @param {string} orderId - Booking ID
     * @param {string} pickUpDate - Pickup date
     * @param {string} pickupLocation - Pickup location
     * @param {string} dropOffDate - Dropoff date
     * @param {string} paymentMethod - Payment method (Hybrid/Online)
     * @param {number} driverCut - Driver's share of the total booking amount
     */
    DRIVER_ASSIGNMENT_EMAIL: (driverName, orderId, pickUpDate, pickupLocation, dropOffDate, paymentMethod, driverCut) => `
<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
        color: #333333;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding: 20px 0;
        background-color: #007bff;
        color: #ffffff;
        border-radius: 8px 8px 0 0;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 20px;
      }
      .details {
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 15px;
      }
      .details p {
        margin: 0;
        font-size: 16px;
        line-height: 1.5;
      }
      .footer {
        text-align: center;
        padding: 20px;
        background-color: #f1f1f1;
        color: #777777;
        border-radius: 0 0 8px 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Booking Assigned</h1>
      </div>
      <div class="content">
        <p>Hello ${driverName},</p>
        <p>A new booking has been assigned to you. Please find the details below:</p>
        <div class="details">
          <p><strong>Booking ID:</strong> ${orderId}</p>
          <p><strong>Pickup Date:</strong> ${pickUpDate}</p>
          <p><strong>Pickup Location:</strong> ${pickupLocation}</p>
          <p><strong>Dropoff Date:</strong> ${dropOffDate}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Your Share:</strong> Rs. ${driverCut}</p>
        </div>
        <p>${
            paymentMethod === 'Hybrid'
                ? 'As the payment method is Hybrid, please collect the payment from the customer at the time of pickup.'
                : 'Since the payment was made online, the amount will be credited to your account after the booking is completed.'
        }</p>
        <p>Please ensure that you are available at the specified pickup time & Accept the booking from your dashboard ASAP.</p>
      </div>
      <div class="footer">
        <p>Best regards,<br>The ${EApplicationEnvironment.SITE_NAME} Team</p>
        <p>For support, contact us at <a href="mailto:${EApplicationEnvironment.SITE_EMAIL}">${EApplicationEnvironment.SITE_EMAIL}</a></p>
      </div>
    </div>
  </body>
</html>
`,
    /**
     *
     * @param {string} driverName - Driver's name
     */
    DRIVER_VERIFIED: (driverName) => `<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
        color: #333333;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding: 20px 0;
        background-color: #28a745;
        color: #ffffff;
        border-radius: 8px 8px 0 0;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 20px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        background-color: #f1f1f1;
        color: #777777;
        border-radius: 0 0 8px 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Driver Verification Completed</h1>
      </div>
      <div class="content">
        <p>Hello ${driverName},</p>
        <p>Congratulations! Your documents have been successfully verified and you are now an official driver with us.</p>
        <p>You can start accepting bookings immediately from your dashboard.</p>
        <p>We are excited to have you on board and look forward to working with you!</p>
      </div>
      <div class="footer">
        <p>Best regards,<br>The ${EApplicationEnvironment.SITE_NAME} Team</p>
        <p>For support, contact us at <a href="mailto:${EApplicationEnvironment.SITE_EMAIL}">${EApplicationEnvironment.SITE_EMAIL}</a></p>
      </div>
    </div>
  </body>
</html>`,
    /**
     *
     * @param {string} driverName - Driver's name
     */
    DRIVER_VERIFICATION_REVOKED: (driverName) => `<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
        color: #333333;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding: 20px 0;
        background-color: #dc3545;
        color: #ffffff;
        border-radius: 8px 8px 0 0;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 20px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        background-color: #f1f1f1;
        color: #777777;
        border-radius: 0 0 8px 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Driver Verification Revoked</h1>
      </div>
      <div class="content">
        <p>Hello ${driverName},</p>
        <p>We regret to inform you that your driver verification has been revoked. You will not be able to accept bookings until the verification process is completed again.</p>
        <p>Please review your submitted documents and contact our support team for further assistance.</p>
      </div>
      <div class="footer">
        <p>Best regards,<br>The ${EApplicationEnvironment.SITE_NAME} Team</p>
        <p>For support, contact us at <a href="mailto:${EApplicationEnvironment.SITE_EMAIL}">${EApplicationEnvironment.SITE_EMAIL}</a></p>
      </div>
    </div>
  </body>
</html>`,
    /**
     *
     * @param {string} username - Driver's name
     * @param {number} amount - Amount
     * @param {string} orderId - OrderId
     */
    PAYOUT_SUCCESS_EMAIL: (username, amount, orderId) => `<html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
        color: #333333;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding: 20px 0;
        background-color: #28a745;
        color: #ffffff;
        border-radius: 8px 8px 0 0;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 20px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        background-color: #f1f1f1;
        color: #777777;
        border-radius: 0 0 8px 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Payout Successful</h1>
      </div>
      <div class="content">
        <p>Hello ${username},</p>
        <p>We are pleased to inform you that a payout of Rs.${amount} has been successfully processed for your order ID: ${orderId}.</p>
        <p>The funds will be transferred to your registered bank account shortly. Please reach out to us if you have any questions.</p>
      </div>
      <div class="footer">
        <p>Best regards,<br>The ${EApplicationEnvironment.SITE_NAME} Team</p>
        <p>For support, contact us at <a href="mailto:${EApplicationEnvironment.SITE_EMAIL}">${EApplicationEnvironment.SITE_EMAIL}</a></p>
      </div>
    </div>
  </body>
</html>`
}
