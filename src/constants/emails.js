export default {
    // Email templates for user-related notifications

    /**
     * Registration Email with OTP
     * @param {string} username - User's name
     * @param {string} otp - One-time password for verification
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
            <h1>Your App</h1>
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
              <h1>Your App</h1>
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
            <h1>Your App</h1>
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
              <h1>Your App</h1>
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
      </html>`
}
