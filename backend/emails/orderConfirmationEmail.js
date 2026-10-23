export const sendOrderConfirmationEmail = async (email, firstName, order) => {
  try {
    console.log("[OTP] Starting Brevo email send");

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
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
        subject: `Order Confirmation - Forever E-Commerce`,
        textContent: `Hi ${firstName},
                   Thank you for your order with Forever E-Commerce.
                   Order ID: ${order._id} 
                   Order Amount: ${order.amount} SAR
                   Payment Method: ${order.paymentMethod}
                   Payment Status: ${order.paymentStatus}
                   We'll keep you updated as your order progresses.
                  Thank you for shopping with Forever E-Commerce.`,
        htmlContent: `
        <div style="margin:0;padding:30px 15px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
 
      <!-- Header -->
      <div style="background:#2563eb;padding:25px 20px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:25px;font-weight:700;">
          Forever E-Commerce
        </h1>
        <p style="margin:8px 0 0;color:#dbeafe;font-size:13px;">
          Thank you for shopping with us
        </p>
      </div>

      <!-- Email Body -->
      <div style="padding:30px 25px;color:#374151;">

        <h2 style="margin:0 0 12px;text-align:center;color:#111827;font-size:23px;">
          Order Confirmed!
        </h2>

        <p style="margin:0 0 25px;text-align:center;font-size:15px;line-height:1.7;">
          Hi ${firstName},<br/>
          Thank you for your order. We have received it successfully.
        </p>

        <!-- Order Details -->
        <div style="padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">

          <p style="margin:0 0 15px;font-size:14px;">
            <strong style="color:#111827;">Order ID:</strong><br/>
            <span style="color:#4b5563;word-break:break-all;">${order._id}</span>
          </p>

          <p style="margin:0 0 15px;font-size:14px;">
            <strong style="color:#111827;">Order Amount:</strong><br/>
            <span style="font-size:19px;font-weight:700;color:#111827;">
              ${order.amount} SAR
            </span>
          </p>

          <p style="margin:0 0 15px;font-size:14px;">
            <strong style="color:#111827;">Payment Method:</strong><br/>
            ${order.paymentMethod}
          </p>

          <p style="margin:0;font-size:14px;">
            <strong style="color:#111827;">Payment Status:</strong><br/>
            <span style="display:inline-block;margin-top:6px;padding:6px 12px;background:#dbeafe;color:#1d4ed8;border-radius:20px;font-size:12px;font-weight:700;">
              ${order.paymentStatus}
            </span>
          </p>

        </div>

        <p style="margin:25px 0 0;text-align:center;font-size:14px;line-height:1.7;color:#4b5563;">
          We'll keep you updated as your order progresses.
          If you have any questions, please contact our support team.
        </p>

      </div>

      <!-- Footer -->
      <div style="padding:18px 20px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">
          Forever E-Commerce Team
        </p>
        <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">
          Thank you for choosing Forever.
        </p>
      </div>

    </div>
  </div>
`,
      }),
      signal: AbortSignal.timeout(20000),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[OTP] Brevo API error:", {
        status: response.status,
        message: result.message,
        code: result.code,
      });

      throw new Error(result.message || "Brevo failed to send the email");
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
