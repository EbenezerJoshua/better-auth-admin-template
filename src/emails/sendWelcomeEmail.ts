import { sendEmail } from "./mailtrapMailer";

const emailHTMLTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Better Auth!</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 48px 24px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
            
            <!-- Header/Logo -->
            <tr>
              <td style="padding: 40px 40px 0 40px; text-align: center;">
                <div style="background-color: #0f172a; width: 48px; height: 48px; border-radius: 12px; display: inline-block; line-height: 48px; color: #ffffff; font-size: 24px; font-weight: bold;">
                  B
                </div>
                <h2 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.025em;">Better Auth Template</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px; color: #334155; font-size: 16px; line-height: 1.6;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;">Welcome Aboard! 🎉</h1>
                
                <p style="margin: 0 0 16px 0;">
                  Hi <strong>${name}</strong>,
                </p>

                <p style="margin: 0 0 16px 0;">
                  We are absolutely thrilled to have you here! Thank you for signing up and joining our community. Your account is all set up and ready to go.
                </p>

                <p style="margin: 0 0 24px 0;">
                  You can now start exploring your dashboard, managing your profile, and controlling your active sessions.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/dashboard"
                        style="
                          display: inline-block;
                          padding: 14px 32px;
                          background-color: #0f172a;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 10px;
                          font-weight: 600;
                          font-size: 16px;
                          transition: background-color 0.2s;
                        "
                      >
                        Go to Dashboard
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 24px 0 0 0; font-size: 14px; color: #64748b; text-align: center;">
                  If you have any questions, just reply to this email. We're here to help!
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-align: center;">
                <p style="margin: 0 0 8px 0;">
                  &copy; 2025 Better Auth Template. All rights reserved.
                </p>
                <p style="margin: 0;">
                  You are receiving this because you created an account on Better Auth Template.
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