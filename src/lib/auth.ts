import { db } from "@/db/drizzle"; // your drizzle instance
import * as schema from "@/db/schema";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "./mailer";
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            await sendEmail({
                to: user.email,
                subject: 'Reset your password',
                text: `Click the link to reset your password: <a href="${url}">${url}</a>`
            })
        },
    },
    
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        discord: {
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        }
    },
    
    session: {
        cookieCache : {
            enabled: true,
            maxAge: 60 
        },
    },
    
    database: drizzleAdapter(db, {
        provider: "pg", // tells better-auth which database provider you are using
        schema: schema,
    }),

    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }: { email: string, otp: string, type: "sign-in" | "email-verification" | "forget-password" }) {
                await sendEmail({
                    to: email,
                    subject: "Your OTP",
                    text: `Your OTP is ${otp}`
                })
            },
        }),
        nextCookies()
    ],
});
