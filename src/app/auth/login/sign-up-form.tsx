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
// import { signUp, signIn } from "../../server/users"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth/auth-client"


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

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard"
    });
  };

  const signInWithGitHub = async () => {
    const res = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard"
    });

    if (res.error) {
      toast.error(res.error.message || "Failed to Sign-In with GitHub.")
    } else {
      toast.success("Signed-In with GitHub successfully!")
    }
  };

  const signInWithDiscord = async () => {
    const res = await authClient.signIn.social({
      provider: "discord",
      callbackURL: "/dashboard"
    });

    if (res.error) {
      toast.error(res.error.message || "Failed to Sign-In with Discord.")
    } else {
      toast.success("Signed-In with Discord successfully!")
    }
  };

  // 2. Define a submit handler.
  async function onSubmit(values: SignUpFormType) {

    setIsLoading(true)

    // Call the sign-up function from authClient
    await authClient.signUp.email(
      { ...values, callbackURL: "/auth/verify-email", },
      {
        onSuccess: () => {
          sessionStorage.setItem("pending_verification_email", JSON.stringify({
            email: values.email,
            createdAt: Date.now(),
          })
          );
          toast.success("Account created. Verify your email.");
          router.push("/auth/verify-email");
        },
        onError: (error) => {
          toast.error(error.error.message || "Failed to Sign-Up.")
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
                    <Input placeholder="********" {...field} type="password" />
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
            <Button variant="outline" type="button" onClick={signInWithGoogle}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Login with Google
            </Button>
            <Button variant="outline" type="button" onClick={signInWithGitHub}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              Sign up with GitHub
            </Button>
            <Button variant="outline" type="button" onClick={signInWithDiscord}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 245 240"
              >
                <path
                  d="M104.4 104.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1.1-6.1-4.5-11.1-10.2-11.1zm36.2 0c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1s-4.5-11.1-10.2-11.1zM189.5 20h-134C24.9 20 10 34.9 10 53.5v133c0 18.6 14.9 33.5 33.5 33.5h113.1l-5.3-18.5 12.8 11.9 12.1 11.2 21.5 19V53.5c0-18.6-14.9-33.5-33.5-33.5zM163 150.6s-5.4-6.4-9.9-12.1c19.7-5.6 27.2-18 27.2-18-6.2 4.1-12.1 7-17.4 9-7.5 3.2-14.7 5.3-21.8 6.6-14.5 2.7-27.8 2-39.3-.1-8.7-1.6-16.2-4-22.5-6.6-3.6-1.4-7.6-3.1-11.6-5.6-.5-.3-1-.6-1.5-.9-.2-.1-.3-.2-.5-.3-2.3-1.3-3.6-2.2-3.6-2.2s7.2 12.1 26.3 17.9c-4.5 5.7-10.1 12.4-10.1 12.4-33.3-1.1-46-22.9-46-22.9 0-48.5 21.7-87.8 21.7-87.8 21.7-16.3 42.3-15.8 42.3-15.8l1.5 1.8c-27.2 7.8-39.7 19.7-39.7 19.7s3.3-1.8 8.8-4.4c15.9-7 28.6-8.9 33.8-9.4.9-.1 1.7-.2 2.6-.2 9.3-1.2 19.8-1.5 30.8-.3 14.6 1.7 30.2 6.1 45.9 16.3 0 0-11.9-11.3-37.6-19.1l2.1-2.4s20.6-.5 42.3 15.8c0 0 21.7 39.3 21.7 87.8 0 0-12.8 21.8-46.1 22.9z"
                  fill="currentColor"
                />
              </svg>
              Sign in with Discord
            </Button>
            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  )
}
