
export const sendContactEmail = async ({
  name,
  email,
  subject,
  message,
}) => {
  try {
    console.log("[CONTACT] Starting Brevo email send");

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

          // Website owner's email
          to: [
            {
              email: process.env.CONTACT_RECEIVER_EMAIL,
            },
          ],

          // Reply directly to the visitor
          replyTo: {
            email,
            name,
          },

          subject: `Contact Form: ${subject}`,

          textContent: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
          `,

          htmlContent: `
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
          `,
        }),

        signal: AbortSignal.timeout(20000),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Brevo failed to send contact email"
      );
    }

    console.log("[CONTACT] Email accepted:", result.messageId);

    return result;

  } catch (error) {
    console.error("[CONTACT] Email error:", error.message);
    throw error;
  }
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
