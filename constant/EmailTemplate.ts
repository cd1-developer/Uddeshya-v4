export const otpEmailTemplate = (otp: string, message: string) => ` 
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OTP Verification</title>
  </head>

  <body style="margin:0; padding:0; background:#f6f9fc; font-family:Arial, sans-serif;">
    <div style="
      max-width:600px;
      margin:auto;
      background:#ffffff;
      border-radius:12px;
      padding:30px;
      box-shadow:0 4px 25px rgba(0,0,0,0.08);
    ">

      <!-- Header with Logo -->
      <div style="text-align:center; margin-bottom:20px;">
        <img 
          src="https://ik.imagekit.io/fcuhugcgk/blue-logo.png"
          alt="UDDSHEYA Leave Management"
          style="height:140px; margin-bottom:10px;"
        />
      </div>

      <h2 style="text-align:center; color:#1e3a8a;">
        UDDSHEYA Leave Management
      </h2>

      <hr style="border:0; height:1px; background:#e5e7eb; margin:20px 0;" />

      <!-- Message -->
      <div style="font-size:16px; line-height:1.6; color:#555; text-align:center;">
        ${message}
      </div>

      <!-- OTP Box -->
      <div style="
        text-align:center; 
        margin:30px auto 10px; 
        font-size:36px; 
        font-weight:bold; 
        letter-spacing:12px;
        color:#1e3a8a;
        background:#f1f5f9;
        border-radius:10px;
        padding:16px 0;
        width:60%;
      ">
        ${otp}
      </div>

      <p style="text-align:center; color:#777; margin-top:10px; font-size:14px;">
        This OTP is valid for the next <strong>1 minutes</strong>.
      </p>

      <p style="text-align:center; color:#aaa; font-size:13px; margin-top:30px;">
        © ${new Date().getFullYear()} UDDSHEYA Leave Management. All rights reserved.
      </p>

    </div>
  </body>
  </html>
`;

export const WelcomeEmailTemplate = (message: string) => `  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
  </head>

  <body style="margin:0; padding:0; background:#f6f9fc; font-family:Arial, sans-serif;">
    <div style="
      max-width:600px;
      margin:auto;
      background:#ffffff;
      border-radius:12px;
      padding:30px;
      box-shadow:0 4px 25px rgba(0,0,0,0.08);
    ">

      <!-- Header with Logo -->
      <div style="text-align:center; margin-bottom:20px;">
        <img 
          src="https://ik.imagekit.io/fcuhugcgk/blue-logo.png"
          alt="UDDSHEYA Leave Management"
          style="height:140px; margin-bottom:10px;"
        />
      </div>

      <h2 style="text-align:center; color:#1e3a8a;">
        UDDSHEYA Leave Management
      </h2>

      <hr style="border:0; height:1px; background:#e5e7eb; margin:20px 0;" />

      <!-- Content -->
      <div style="font-size:16px; line-height:1.6; color:#555;text-align:center">
        ${message}
      </div>

      <div style="text-align:center; margin-top:30px;">
        <a href="https://5eb7adc83700.ngrok-free.app/
          style="
            display:inline-block;
            background:#2563eb;
            color:#ffffff;
            padding:12px 22px;
            border-radius:8px;
            text-decoration:none;
            font-weight:bold;
          ">
          Login now
        </a>
      </div>

      <p style="text-align:center; color:#aaa; font-size:13px; margin-top:30px;">
        © ${new Date().getFullYear()} UDDSHEYA Leave Management. All rights reserved.
      </p>
    </div>
  </body>
  </html>`;
