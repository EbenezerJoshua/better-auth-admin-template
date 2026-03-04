import { db } from "@/db/drizzle"; // your drizzle instance
import * as schema from "@/db/schema";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "../../emails/mailtrapMailer";
import { emailOTP } from "better-auth/plugins";
import { sendPasswordResetEmail } from "@/emails/sendPasswordResetMail";
import { sendVerificationEmail } from "@/emails/sendVerificationMail";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail({ user, url });
        },
    },

    emailVerification: {
        autoSignInAfterVerification: true,
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }, request) => {
            await sendVerificationEmail({ user, url });
        }
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
        cookieCache: {
            enabled: false,
            maxAge: 0
        },
    },

    database: drizzleAdapter(db, {
        provider: "pg", // tells better-auth which database provider you are using
        schema: schema,
    }),

    plugins: [
        // emailOTP({
        //     async sendVerificationOTP({ email, otp, type }: { email: string, otp: string, type: "sign-in" | "email-verification" | "forget-password" }) {
        //         await sendEmail({
        //             to: email,
        //             subject: "Your OTP",
        //             text: `Your OTP is ${otp}`
        //         })
        //     },
        // }),
        nextCookies()
    ],
});
