import { sendEmail } from "./mailtrapMailer";

const emailHTMLTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to the Community!</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:6px; overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="padding:20px 24px; background-color:#1e293b; color:#ffffff; text-align:center;">
                <h1 style="margin:0; font-size:24px; font-weight:bold;">Welcome Aboard! 🎉</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 24px; color:#334155; font-size:16px; line-height:1.6;">
                <p style="margin-top:0;">
                  Hi <strong>${name}</strong>,
                </p>

                <p style="margin-top:16px;">
                  We are absolutely thrilled to have you here! Thank you for signing up and joining our growing community.
                </p>

                <p style="margin-top:16px;">
                  Your account is all set up. You can now start exploring the dashboard, managing your sessions, and taking full advantage of the platform.
                </p>

                <p style="text-align:center; margin:32px 0;">
                  <a
                    href="https://localhost:3000/dashboard"
                    style="
                      display:inline-block;
                      padding:14px 28px;
                      background-color:#2563eb;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:6px;
                      font-weight:bold;
                    "
                  >
                    Go to Dashboard
                  </a>
                </p>

                <p style="margin-bottom:0;">
                  If you have any questions or need help getting started, simply reply to this email. We're always here to help.
                </p>

                <p style="margin-top:24px; margin-bottom:0;">
                  Best,<br/>
                  The Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 24px; background-color:#f8fafc; color:#64748b; font-size:12px; text-align:center;">
                <p style="margin:0;">
                  You are receiving this email because you recently signed up for an account.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const emailTextTemplate = (name: string) => `
Welcome Aboard, ${name}! 🎉

We are absolutely thrilled to have you here! Thank you for signing up and joining our growing community.

Your account is all set up. You can now start exploring the dashboard and managing your sessions.

Go to Dashboard: https://your-domain.com/dashboard

If you have any questions or need help getting started, simply reply to this email. We're always here to help.

Best,
The Team
`;

export async function sendWelcomeEmail(user: { email: string, name: string }) {
    await sendEmail({
        to: user.email,
        subject: 'Welcome to our platform! 🎉',
        html: emailHTMLTemplate(user.name),
        text: emailTextTemplate(user.name),
    });
}