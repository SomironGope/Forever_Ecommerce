


export const sendPasswordResetEmail = async (otp, email) => {
 
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
          subject: "Password Reset",
          textContent: `Your password reset code is ${otp}. It expires in 5 minutes.`,
          htmlContent:  `
   <div style="background:#f4f4f5;font-family:Arial,sans-serif;padding:40px 20px;margin-top:10px;border-radius:12px;">

  <div style="max-width:500px;margin:0 auto;background:#eff6ff;border:2px dashed #2563eb;border-radius:10px;padding:20px;">

    <div style="max-width:500px;margin:0 auto;background:#ffffff;border-radius:12px;padding:40px 30px;box-sizing:border-box;">

      <h2 style="color:#2563eb;margin:0 0 10px;">Password Reset</h2>

      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        Welcome to Forever E-commerce
      </p>

      <p style="color:#4b5563;font-size:16px;line-height:1.6;">
        We received a request to reset your password. Use the OTP below to continue.
      </p>

      <h1 style="margin:25px 0;color:#2563eb;letter-spacing:8px;text-align:center;">
        ${otp}
      </h1>

      <p style="color:#ef4444;font-weight:bold;text-align:center;">
        This OTP will expire in <strong>5 minutes</strong>.
      </p>

      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:25px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>

      <hr style="margin:25px 0;border:none;border-top:1px solid #e5e7eb;">

      <p style="color:#9ca3af;font-size:12px;text-align:center;">
        © 2026 Forever E-Commerce. All rights reserved.
      </p>

    </div>

  </div>

</div>
`
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



