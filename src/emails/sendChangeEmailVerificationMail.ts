import { sendEmail } from "./mailtrapMailer";

type ChangeEmailVerificationOptions = {
    user: {
        email: string;
        name: string;
    };
    url: string;
};

const emailHTMLTemplate = (url: string) => {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Better Auth Template";
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your New Email Address</title>
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
                <img src="${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/favicon.ico" width="48" height="48" alt="Logo" style="display: inline-block; border-radius: 12px;" />
                <h2 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.025em;">${appName}</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px; color: #334155; font-size: 16px; line-height: 1.6;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;">Verify your new email</h1>
                
                <p style="margin: 0 0 16px 0;">
                  You requested to change the email address for your account. Please confirm your new email address by clicking the button below.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${url}"
                        style="
                          display: inline-block;
                          padding: 14px 32px;
                          background-color: #0f172a;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 10px;
                          font-weight: 600;
                          font-size: 16px;
                        "
                      >
                        Verify New Email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 16px 0; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; word-break: break-all;">
                  <a href="${url}" style="color: #0f172a; text-decoration: underline;">${url}</a>
                </p>

                <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">
                  If you did not request this change, you can safely ignore this email. Your email address will remain unchanged.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; text-align: center;">
                <p style="margin: 0 0 8px 0;">
                  &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
                </p>
                <p style="margin: 0;">
                  This link will expire for security reasons.
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
};

const emailTextTemplate = (url: string) => `
Verify your new email address

You have requested to change the email address associated with your account. Please confirm your new email address by opening the link below:

${url}

If you did not request to change your email address, you can safely ignore this email and your email address will remain unchanged.
For security reasons, this verification link may expire.
`;

export async function sendChangeEmailVerificationMail({ user, url }: ChangeEmailVerificationOptions) {
    await sendEmail({
        to: user.email,
        subject: 'Verify your new email address',
        html: emailHTMLTemplate(url),
        text: emailTextTemplate(url),
    });
}
