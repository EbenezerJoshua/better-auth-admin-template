"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"

const forgotPasswordSchema = z.object({
  email: z.email().min(1),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

// We split the actual form into its own component so it can be wrapped in a <Suspense> boundary. 
// This is required in Next.js when reading URL query parameters via useSearchParams.
function ForgotPasswordFormContent() {

  // We use the search parameters hook to see if the user passed an email from the login page
  const searchParams = useSearchParams()
  const prefilledEmail = searchParams.get("email") || ""

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: prefilledEmail, // Automatically populates if the user typed it previously
    },
  })

  const { isSubmitting } = form.formState
  const router = useRouter()

  // Implement a cooldown state so users cannot spam the "Forgot Password" email button
  const [cooldown, setCooldown] = useState(0);

  // Countdown effect to reduce the cooldown every second
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0; // stop timer at zero
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleForgotPassword(data: ForgotPasswordForm) {
    // If we're still waiting on the cooldown timer, do absolutely nothing.
    if (cooldown > 0) return;

    await authClient.requestPasswordReset(
      {
        ...data,
        redirectTo: "/auth/reset-password",
      },
      {
        onError: error => {
          toast.error(
            error.error.message || "Failed to send password reset email"
          )
        },
        onSuccess: () => {
          toast.success("Password reset email sent!", {
            description: "Please check your inbox for the reset link.",
          })
          // Set a 30 second cooldown before they can click send again
          setCooldown(30)
        },
      }
    )
  }

  async function handleBack() {
    form.reset()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-6 flex flex-col w-full"
              onSubmit={form.handleSubmit(handleForgotPassword)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={handleBack}>
                  Back to Login
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || cooldown > 0}
                  className="flex-1 w-full"
                >
                  {isSubmitting
                    ? "Sending Link..."
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Send Reset Link"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ForgotPassword() {
  return (
    // <Suspense> is required here because `useSearchParams` needs to de-opt to client rendering on load
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ForgotPasswordFormContent />
    </Suspense>
  )
}