
export const verifyEmail = async (otp, email) => {
 
  try {
    console.log("[OTP] Starting Brevo email send");

    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Forever E-Commerce",
            email: process.env.BREVO_SENDER_EMAIL,
          },
          to: [{ email }],
          subject: "Verify your Forever E-Commerce account",
          textContent: `Your verification code is ${otp}. It expires in 10 minutes.`,
          htmlContent:  `<div style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

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
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[OTP] Brevo API error:", {
        status: response.status,
        message: result.message,
        code: result.code,
      });

      throw new Error(
        result.message || "Brevo failed to send the email"
      );
    }

    console.log("[OTP] Brevo accepted email:", result.messageId);

    return result;
  } catch (error) {
    console.error("[OTP] Email error:", {
      message: error.message,
      name: error.name,
    });

    throw error;
  }
};
