// src/lib/mail.ts

import nodemailer from 'nodemailer'; 

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT ?? 587),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

type SendEmailOptions = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
    if (!process.env.MAILTRAP_FROM_EMAIL) {
        throw new Error("MAILTRAP_FROM_EMAIL is not set");
    }

    await transporter.sendMail({
        from: `"Better Auth Template App" <${process.env.MAILTRAP_FROM_EMAIL}>`,
        to,
        subject,
        text,
        html,
    });
}
