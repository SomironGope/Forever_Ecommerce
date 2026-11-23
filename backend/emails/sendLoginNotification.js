
export const sendLoginNotification = async (firstName, email) => {
  try {
    console.log("[LOGIN EMAIL] Starting login notification");

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
          subject: "New login to your Forever account",

          textContent: `
Hello ${firstName},

A successful login to your Forever E-Commerce account was detected.

If this was you, no action is needed.

If you did not log in, please change your password immediately
and contact our support team.

Thank you,
Forever E-Commerce Team
          `,

          htmlContent: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 25px;
              color: #333;
              border: 1px solid #eee;
              border-radius: 8px;
            ">
              <h2 style="color: #222;">
                Forever E-Commerce
              </h2>

              <h3>Hello ${firstName},</h3>

              <p>
                A successful login to your Forever E-Commerce
                account was detected.
              </p>

              <p>
                If this was you, no action is needed.
              </p>

              <p style="color: #d9534f;">
                If you did not log in, please change your
                password immediately and contact our support team.
              </p>

              <p>
                Thank you for shopping with us.
              </p>

              <p>
                <strong>Forever E-Commerce Team</strong>
              </p>
            </div>
          `,

        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[LOGIN EMAIL] Brevo error:", result);
      throw new Error(
        result.message || "Failed to send login notification"
      );
    }

    console.log(
      "[LOGIN EMAIL] Email accepted:",
      result.messageId
    );

    return result;

  } catch (error) {
    console.error(
      "[LOGIN EMAIL] Error:",
      error.message
    );

    throw error;
  }
};
