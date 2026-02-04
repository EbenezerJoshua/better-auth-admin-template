import { sendEmail } from "./mailer";

type PasswordResetEmailOptions = {
    user : {
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
        <title>Reset Your Password</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px;">
        <tr>
            <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:6px; overflow:hidden;">
                
                <!-- Header -->
                <tr>
                <td style="padding:20px 24px; background-color:#0f172a; color:#ffffff;">
                    <h1 style="margin:0; font-size:20px;">Reset your password</h1>
                </td>
                </tr>

                <!-- Body -->
                <tr>
                <td style="padding:24px; color:#334155; font-size:14px; line-height:1.6;">
                    <p style="margin-top:0;">
                    We received a request to reset your password. Click the button below to create a new one.
                    </p>

                    <p style="text-align:center; margin:24px 0;">
                    <a
                        href="${url}"
                        style="
                        display:inline-block;
                        padding:12px 20px;
                        background-color:#2563eb;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:4px;
                        font-weight:bold;
                        "
                    >
                        Reset Password
                    </a>
                    </p>

                    <p>
                    If the button doesn’t work, copy and paste the following link into your browser:
                    </p>

                    <p style="word-break:break-all;">
                    <a href="${url}" style="color:#2563eb;">${url}</a>
                    </p>

                    <p style="margin-bottom:0;">
                    If you did not request a password reset, you can safely ignore this email.
                    </p>
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td style="padding:16px 24px; background-color:#f8fafc; color:#64748b; font-size:12px;">
                    <p style="margin:0;">
                    This password reset link may expire for security reasons.
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
Reset your password

We received a request to reset your password.

To create a new password, open the link below in your browser:
${url}

If you did not request this change, you can safely ignore this email.
For security reasons, this link may expire.
`;

export async function sendPasswordResetEmail({ user, url }: PasswordResetEmailOptions) {
    await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: emailHTMLTemplate(url),
        text: emailTextTemplate(url),
    });
}