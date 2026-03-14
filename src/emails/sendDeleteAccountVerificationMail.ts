import { sendEmail } from "./mailtrapMailer";

type DeleteAccountVerificationOptions = {
    user: {
        email: string;
        name: string;
    };
    url: string;
};

const emailHTMLTemplate = (url: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Verify Account Deletion</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:6px; overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="padding:20px 24px; background-color:#0f172a; color:#ffffff;">
                <h1 style="margin:0; font-size:20px;">Verify account deletion</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px; color:#334155; font-size:14px; line-height:1.6;">
                <p style="margin-top:0;">
                  We received a request to delete your account. This action is irreversible. Please confirm your request by clicking the button below.
                </p>

                <p style="text-align:center; margin:24px 0;">
                  <a
                    href="${url}"
                    style="
                      display:inline-block;
                      padding:12px 20px;
                      background-color:#dc2626;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:4px;
                      font-weight:bold;
                    "
                  >
                    Delete Account
                  </a>
                </p>

                <p>
                  If the button doesn’t work, copy and paste this link into your browser:
                </p>

                <p style="word-break:break-all;">
                  <a href="${url}" style="color:#dc2626;">${url}</a>
                </p>

                <p style="margin-bottom:0;">
                  If you did not request to delete your account, please ignore this email and your account will remain secure.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 24px; background-color:#f8fafc; color:#64748b; font-size:12px;">
                <p style="margin:0;">
                  This verification link may expire for security reasons.
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
