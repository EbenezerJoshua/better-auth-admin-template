"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth/auth-client"
import { PasswordInput } from "@/components/ui/password-input"
import { SocialAuthButtons } from "./social-auth-buttons"
import { PasskeyButton } from "./passkey-button"


const signInSchema = z.object({
  email: z.string(),
  password: z.string(),
})

type SignInFormType = z.infer<typeof signInSchema>;

export function SignInForm() {

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<SignInFormType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })



  // 2. Define a submit handler.
  async function onSubmit(values: SignInFormType) {
    await authClient.signIn.email(
      { ...values, callbackURL: "/dashboard" },
      {
        onSuccess: () => {
          toast.success("Signed in successfully!")
          router.push("/dashboard")
        },
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            toast.error("Please verify your email address");
            router.push("/verify-email")
          } else {
            toast.error(ctx.error.message || "Failed to Sign-In.")
          }
          setIsLoading(false)
        },
        onSettled: () => {
          setIsLoading(false)
        }
      }
    )
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Sign into your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to sign into your account
            </p>
          </div>
          <Field>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="test@email.com" {...field} type="email" autoComplete="email webauthn" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="current-password webauthn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Signing In..." : "Sign In"}</Button>
          </Field>
          <PasskeyButton />
          <FieldDescription className="text-center">
            <Link
              href={`/forgot-password${form.watch("email") ? `?email=${encodeURIComponent(form.watch("email"))}` : ""}`}
              className="underline underline-offset-4"
            >
              Forgot Password ?
            </Link>
          </FieldDescription>
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field>
            <SocialAuthButtons />
          </Field>
        </FieldGroup>
      </form>
    </Form>
  )
}
