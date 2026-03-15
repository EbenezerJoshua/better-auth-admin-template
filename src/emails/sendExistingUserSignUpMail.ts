import { sendEmail } from "./mailtrapMailer";

type ExistingUserSignUpOptions = {
    user: {
        email: string;
        name: string;
    };
};

const emailHTMLTemplate = () => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sign-Up Attempt</title>
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
                <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a; text-align: center;">Sign-up attempt</h1>
                
                <p style="margin: 0 0 16px 0;">
                  Hello,
                </p>

                <p style="margin: 0 0 16px 0;">
                  Someone recently tried to create an account using your email address. Since you already have an account with us, you can simply sign in to access your profile.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/login"
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
                        Sign In to Your Account
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">
                  If this was not you, your account is still secure and you can safely ignore this email.
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
                  You are receiving this because a registration attempt was made with this address.
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

const emailTextTemplate = () => `
Sign-up attempt with your email

Hello,

Someone recently tried to create an account using your email address. 
Since you already have an account with us, you can simply sign in to access your profile.

If this was not you, your account is still secure and you can safely ignore this email.
`;

export async function sendExistingUserSignUpMail({ user }: ExistingUserSignUpOptions) {
    await sendEmail({
        to: user.email,
        subject: "Sign-up attempt with your email",
        html: emailHTMLTemplate(),
        text: emailTextTemplate(),
    });
}
