// import nodeMailer from 'nodemailer';

// export const verifyEmail = (otp,email) => {
//   const transporter = nodeMailer.createTransport ({
//     service : 'gmail',
//     auth : {
//       user : process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS
//     }
//   });

//   const mailConfig = {
//     from: process.env.MAIL_USER,
//     to: email,
//     subject: 'Verification mail',
//     html: `<div style="background:#f4f4f5;font-family:Arial,sans-sefif;padding:40px 20px;margin-top:10px;border-radius:12px;">
//     <div style="max-width:500px;background:#eff6ff; border:2px dashed #2563eb flex-direction:column; border-radius:10px; padding:20px; margin:25px 0;">
//      <div style="max-width:500px;margin:0 auto;background:#ffffff;border-radius:12px;padding:40px 30px;">
//      <h2 style="color:2563eb;margin-bottom:10px">Email Verification</h2>
//      <p style="color:#4b5563;font-size: 16px;line-height: 1.6;">Welcome to Forever E-commerce</p>
//     <p style="color:#4b5563;font-size:16px;" >Use the verification code below to verify your account</p>
//          <h1 style="margin:0;color:#2563eb;letter-spacing:8px;text-align:center;">${otp}</h1>

//     </div>

//     <p style="color:#ef4444;font-weight:bold;text-align-center">This OTP will expire in 10 minutes.</p>
//      <p style="color:#6b7280;font-size:14px;margin-top:25px;"> If you did not create an account, please ignore this email. </p>
//       <hr style=margin:25px 0;border:none;border-top:1px solid #e5e7eb;"
//      <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 Forever E-Commerce. All rights reserve.

//       </div>
//     </div>

//     `
//   }
//   transporter.sendMail (mailConfig, function (error,info) {
//     if(error) {
//      console.log(error);
//      return;

//     }
//      console.log("OTP sent successfully!")
//       console.log(info)
//   });
// };

import nodemailer from "nodemailer";

export const verifyEmail = async (otp, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailConfig = {
    from: `"Forever E-Commerce" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Verify your Forever E-Commerce account",
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

        <div style="padding:35px 15px;">

          <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">

            <!-- Header -->
           <div style="background:#1e3a8a;padding:30px 20px;text-align:center;">

            <div style="display:inline-block;background:#ffffff;border-radius:12px;padding:10px 15px;margin-bottom:15px;">
                 <span style="font-size:21px;font-weight:bold;letter-spacing:2px;color:#1e3a8a;">
                  FOREVER
                  </span>
            </div>

            <p style="font-size:11px;font-weight:bold;letter-spacing:3px;color:#bfdbfe;margin:0;">
               E-COMMERCE
            </p>

            </div>

           <!-- Main Content -->
          <div style="padding:35px 28px 30px;text-align:center;">

              <div style="width:58px;height:58px;line-height:58px;margin:0 auto 20px;background:#dbeafe;border-radius:50%;font-size:28px;color:#1d4ed8;">
               &#9993;
             </div>

            <h1 style="font-size:26px;line-height:1.3;color:#0f172a;margin:0 0 14px;font-weight:700;">
                Verify Your Email
            </h1>

           <p style="font-size:15px;line-height:1.8;color:#475569;margin:0 0 10px;">
             Welcome to <strong style="color:#1e40af;">Forever E-Commerce!</strong>
           </p>

          <p style="font-size:14px;line-height:1.8;color:#64748b;margin:0 0 28px;">
            We're happy you're here. Please enter the verification code below to complete your registration.
          </p>

           <!-- OTP Card -->
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:24px 12px;margin:0 0 22px;">

              <p style="font-size:11px;font-weight:bold;letter-spacing:2px;color:#1d4ed8;margin:0 0 14px;">
               YOUR VERIFICATION CODE
             </p>

             <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1e3a8a;line-height:1.4;word-break:break-all;">
               ${otp}
             </div>

            <p style="font-size:12px;color:#64748b;margin:12px 0 0;">
               Enter this code on the verification page.
            </p>

           </div>

        <!-- Expiry Notice -->
           <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:9px;padding:12px;margin-bottom:24px;">

             <p style="font-size:13px;color:#9a3412;line-height:1.6;margin:0;">
              <strong>&#9200; Security notice:</strong> This code expires in <strong>10 minutes</strong>.
             </p>

           </div>

           <p style="font-size:13px;line-height:1.8;color:#64748b;margin:0 0 25px;">
             Didn't request this code? No worries — simply ignore this email. Never share your verification code with anyone.
              </p>

           <div style="height:1px;background:#e2e8f0;margin:0 0 22px;"></div>

           <p style="font-size:12px;line-height:1.7;color:#94a3b8;margin:0;">
             This is an automated message. Please do not reply to this email.
           </p>

         </div>

      <!-- Footer -->
      <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 15px;text-align:center;">

        <p style="font-size:13px;font-weight:bold;letter-spacing:1px;color:#334155;margin:0 0 8px;">
          FOREVER E-COMMERCE
        </p>

        <p style="font-size:11px;line-height:1.7;color:#94a3b8;margin:0;">
          Style that lasts. Quality you can trust.
        </p>

        <p style="font-size:11px;color:#94a3b8;margin:12px 0 0;">
          &copy; 2026 Forever E-Commerce. All rights reserved.
        </p>

      </div>

    </div>

  </div>

</div>
`,
  };

  try {
    const info = await transporter.sendMail(mailConfig);
    return info;
  } catch (error) {
    console.error("[OTP] Email error:", {
      message: error.message,
      code: error.code,
      response: error.response,
    });

    throw error;
  }
};
