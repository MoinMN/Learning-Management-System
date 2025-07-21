export const otpTemplate = `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Verification</title>
  <style>
    body {
      font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f5f7fa;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      background: #ffffff;
      margin: 40px auto;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      padding: 32px;
      color: #fff;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .body {
      padding: 32px;
      text-align: center;
    }
    .otp-box {
      display: inline-flex;
      justify-content: center;
      gap: 12px;
      margin: 24px 0;
    }
    .otp-digit {
      width: 48px;
      height: 48px;
      font-size: 24px;
      font-weight: bold;
      background: #f0f0f0;
      border-radius: 8px;
      text-align: center;
      line-height: 48px; /* Ensures vertical centering */
    }
    .info {
      font-size: 14px;
      color: #666;
      margin-top: 16px;
    }
    .footer {
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    @media (max-width: 600px) {
      .otp-digit {
        width: 40px;
        height: 40px;
        font-size: 20px;
        line-height: 40px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="body">
      <p>Use the following OTP to verify your account:</p>
      <div class="otp-box">
        <div class="otp-digit">{digit1}</div>
        <div class="otp-digit">{digit2}</div>
        <div class="otp-digit">{digit3}</div>
        <div class="otp-digit">{digit4}</div>
        <div class="otp-digit">{digit5}</div>
        <div class="otp-digit">{digit6}</div>
      </div>
      <p class="info">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
    </div>
    <div class="footer">
      If you did not request this, please ignore this email.
    </div>
  </div>
</body>
</html>
`;

export const generateWelcomeEmail = (user_name, role, dashboard_link, help_link) => {
  const roleText = role === "SELLER"
    ? `<p>
        Welcome aboard as a <strong>seller</strong>, ${user_name}! We're thrilled to have you grow your business with us.
        Start adding your products and reach a wide audience of active buyers!
      </p>`
    : `<p>
        Thanks for joining us as a <strong>viewer</strong>. You're now part of a growing community of curious and excited shoppers.
        Start exploring thousands of great products and discover new favorites every day!
      </p>`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f6f8fa;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      .header {
        background-color: #4f46e5;
        padding: 20px 40px;
        color: #ffffff;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 30px 40px;
        color: #333;
      }
      .content h2 {
        font-size: 22px;
        margin-bottom: 10px;
      }
      .content p {
        font-size: 16px;
        line-height: 1.6;
      }
      .button {
        margin-top: 30px;
        text-align: center;
      }
      .button a {
        background-color: #4f46e5;
        color: #fff;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 5px;
        font-weight: bold;
      }
      .footer {
        background-color: #f1f1f1;
        padding: 15px;
        text-align: center;
        font-size: 13px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to Our Platform</h1>
      </div>
      <div class="content">
        <h2>Hello, ${user_name} 👋</h2>

        ${roleText}

        <div class="button">
          <a href="${dashboard_link}">Go to Dashboard</a>
        </div>

        <p style="margin-top: 20px;">
          Need help? Visit our <a href="${help_link}" style="color: #4f46e5;">Help Center</a>.
        </p>
      </div>
      <div class="footer">
        &copy; 2025 LMS. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

export const resetPassword = `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0;">
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #4f46e5; padding: 20px; color: #ffffff; text-align: center;">
                <h1 style="margin: 0;">Reset Your Password</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <p style="font-size: 16px; color: #333;">Hi {user_name},</p>
                <p style="font-size: 16px; color: #333;">
                  We received a request to reset your password. Click the button below to reset it. This link will expire in <strong>1 hour</strong> and can only be used <strong>once</strong>.
                </p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="{reset_link}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
                </p>
                <p style="font-size: 14px; color: #666;">
                  If you didn’t request a password reset, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #aaa; text-align: center;">
                  &copy; 2025 LMS. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`