const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Sends a plain-text/HTML email via Resend. If no API key is configured
// (e.g. local dev), it just logs the email instead of failing.
async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.log(`[DEV] Would send email to ${to}\nSubject: ${subject}\n${html}`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Watchtower <onboarding@resend.dev>',
      to,
      subject,
      html
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Resend API error (${res.status}):`, text);
  }
}

async function sendPasswordResetEmail(to, resetUrl) {
  await sendEmail({
    to,
    subject: 'Reset your Watchtower password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Reset your password</h2>
        <p>Someone (hopefully you) requested a password reset for your Watchtower account.</p>
        <p><a href="${resetUrl}" style="background:#F5A623; color:#1A1206; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:600;">Reset password</a></p>
        <p style="color:#888; font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  });
}

module.exports = { sendEmail, sendPasswordResetEmail };
