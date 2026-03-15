import { sendEmail } from "./mailtrapMailer";

type DeleteAccountVerificationOptions = {
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
    <title>Verify Account Deletion</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; padding: 48px 24px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #fee2e2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.05), 0 2px 4px -1px rgba(220, 38, 38, 0.03);">
            
            <!-- Header/Logo (Danger Variaton) -->
            <tr>
              <td style="padding: 40px 40px 0 40px; text-align: center;">
                <img src="${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/favicon.ico" width="48" height="48" alt="Logo" style="display: inline-block; border-radius: 12px; border: 2px solid #dc2626;" />
                <h2 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 700; color: #dc2626; letter-spacing: -0.025em;">Action Required</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px; color: #334155; font-size: 16px; line-height: 1.6;">
                <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;">Delete your account?</h1>
                
                <p style="margin: 0 0 16px 0;">
                  We received a request to delete your account. <strong>This action is irreversible</strong> and will result in the loss of all your data.
                </p>

                <p style="margin: 0 0 16px 0;">
                  If you are absolutely sure, please confirm your request by clicking the button below.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${url}"
                        style="
                          display: inline-block;
                          padding: 14px 32px;
                          background-color: #dc2626;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 10px;
                          font-weight: 600;
                          font-size: 16px;
                        "
                      >
                        Delete My Account
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 16px 0; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; word-break: break-all;">
                  <a href="${url}" style="color: #dc2626; text-decoration: underline;">${url}</a>
                </p>

                <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">
                  If you did not request to delete your account, please ignore this email. Your account will remain safe.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px; background-color: #fef2f2; border-top: 1px solid #fee2e2; color: #991b1b; font-size: 12px; text-align: center;">
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
Verify account deletion

We received a request to delete your account. This action is irreversible. Please confirm your request by opening the link below:

${url}

If you did not request to delete your account, please ignore this email and your account will remain secure.
For security reasons, this verification link may expire.
`;

export async function sendDeleteAccountVerificationMail({ user, url }: DeleteAccountVerificationOptions) {
    await sendEmail({
        to: user.email,
        subject: 'Verify account deletion',
        html: emailHTMLTemplate(url),
        text: emailTextTemplate(url),
    });
}
