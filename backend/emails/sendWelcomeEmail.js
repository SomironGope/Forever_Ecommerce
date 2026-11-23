export const sendWelcomeEmail = async (firstName, email) => {
  try {
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
          subject: "Welcome to Forever E-Commerce!",
          textContent: `Hello ${firstName}, your email has been verified successfully. Welcome to Forever E-Commerce!`,
          htmlContent: `
            <div style="font-family:Arial,sans-serif;background:#f1f5f9;padding:30px;">
              <div style="max-width:520px;margin:auto;background:white;padding:30px;border-radius:12px;text-align:center;">
                <h1 style="color:#1e3a8a;">FOREVER</h1>
                <h2>Welcome, ${firstName}!</h2>
                <p>Your email has been successfully verified.</p>
                <p>Thank you for joining Forever E-Commerce.</p>
                <p style="color:#64748b;">Style that lasts. Quality you can trust.</p>
              </div>
            </div>
          `,
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Welcome email failed");
    }

    console.log("[WELCOME] Email accepted:", result.messageId);

    return result;
  } catch (error) {
    console.error("[WELCOME] Email error:", error.message);
    throw error;
  }
};