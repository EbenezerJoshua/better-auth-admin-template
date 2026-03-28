import { db } from "@/db/drizzle"; // your drizzle instance
import * as schema from "@/db/schema";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, emailOTP, oneTap } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins/two-factor"
import { passkey } from "@better-auth/passkey"
import { sendPasswordResetEmail } from "@/emails/sendPasswordResetMail";
import { sendVerificationEmail } from "@/emails/sendVerificationMail";
import { sendExistingUserSignUpMail } from "@/emails/sendExistingUserSignUpMail";
import { sendInviteEmail } from "@/emails/sendInviteEmail";
import { createAuthMiddleware } from "better-auth/api";
import { sendWelcomeEmail } from "@/emails/sendWelcomeEmail";
import { sendChangeEmailVerificationMail } from "@/emails/sendChangeEmailVerificationMail";
import { sendDeleteAccountVerificationMail } from "@/emails/sendDeleteAccountVerificationMail";
import { ac, admin, user } from "@/lib/auth/permissions"

export const auth = betterAuth({
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ user, url, newEmail }: { user: any, url: string, newEmail: string }) => {
                await sendChangeEmailVerificationMail({
                    user: { ...user, email: newEmail },
                    url,
                });
            },
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountVerification: async ({ user, url }: { user: any, url: string }) => {
                await sendDeleteAccountVerificationMail({ user, url });
            },
        },
        // additionalFields: {
            // favoriteNumber: {
            //     type: "number",
            //     required: true,
            // },
        // },
        additionalFields: {
            // This field tracks whether the user was invited by an admin
            // and has not yet set their own password via the invite link.
            invitePending: {
                type: "boolean" as const,
                required: false,
                defaultValue: false,
                // Prevent regular users from setting this field themselves
                input: false,
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            // If the user was invited by an admin, send the invitation email
            // instead of the generic password reset email.
            if ((user as any).invitePending) {
                await sendInviteEmail({ user, url });
            } else {
                await sendPasswordResetEmail({ user, url });
            }
        },
        onExistingUserSignUp: async (data: any) => {
            if (data?.user) {
                await sendExistingUserSignUpMail({ user: data.user });
            }
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
        twoFactor(),
        passkey(),
        oneTap(),
        adminPlugin({
            ac,
            roles: {
                admin,
                user,
            },
        }),
        nextCookies()
    ],
    hooks: {
        after: createAuthMiddleware(async ctx => {
            if (ctx.path.startsWith("/sign-up")) {
                const user = ctx.context.newSession?.user ?? {
                    name: ctx.body.name,
                    email: ctx.body.email,
                }

                if (user != null) {
                    // await sendWelcomeEmail(user) // This will not work in testing environment because of the limitations with mailtrap in free account. It cannot send multiple emails in the free tier
                }
            }
        }),
    },
});
    