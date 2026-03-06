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
    <title>Sign-Up Attempt</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:6px; overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="padding:20px 24px; background-color:#0f172a; color:#ffffff;">
                <h1 style="margin:0; font-size:20px;">Sign-up attempt with your email</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:24px; color:#334155; font-size:14px; line-height:1.6;">
                <p style="margin-top:0;">
                  Hello,
                </p>
                <p>
                  Someone recently tried to create an account using your email address. 
                  Since you already have an account with us, you can simply sign in to access your profile.
                </p>
                <p style="text-align:center; margin:24px 0;">
                  <a
                    href="\${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login"
                    style="
                      display:inline-block;
                      padding:12px 20px;
                      background-color:#0f172a;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:4px;
                      font-weight:bold;
                    "
                  >
                    Sign In to Your Account
                  </a>
                </p>
                <p style="margin-bottom:0;">
                  If this was not you, your account is still secure and you can safely ignore this email.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:16px 24px; background-color:#f8fafc; color:#64748b; font-size:12px;">
                <p style="margin:0;">
                  You are receiving this email because a registration attempt was made with this address.
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
