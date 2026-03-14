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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth/auth-client"
import { PasswordInput } from "@/components/ui/password-input"
import { SocialAuthButtons } from "./social-auth-buttons"

const signUpSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
})

type SignUpFormType = z.infer<typeof signUpSchema>;

export function SignUpForm() {

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<SignUpFormType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })



  // 2. Define a submit handler.
  async function onSubmit(values: SignUpFormType) {

    setIsLoading(true)

    // Call the sign-up function from authClient
    await authClient.signUp.email(
      { ...values, callbackURL: "/verify-email", },
      {
        onSuccess: () => {
          sessionStorage.setItem("pending_verification_email", JSON.stringify({
            email: values.email,
            createdAt: Date.now(),
          })
          );
          toast.success("Account created. Verify your email.");
          router.push("/verify-email");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to Sign-Up.")
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
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to create your account
            </p>
          </div>
          <Field>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="test@email.com" {...field} />
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
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Signing Up..." : "Sign Up"}</Button>
          </Field>
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field>
            <SocialAuthButtons />
          </Field>
        </FieldGroup>
      </form>
    </Form>
  )
}
