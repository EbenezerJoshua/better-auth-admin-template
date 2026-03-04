"use server"

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";


export const signIn = async () => {
    await auth.api.signInEmail({
        headers: await headers(),
        body: {
            email: "test@gmail.com",
            password: "password123"
        }
    })
}

export const signUp = async () => {
    await auth.api.signUpEmail({
        body: {
            email: "test@gmail.com",
            password: "password123",
            name: "Test User"
        }
    })
}