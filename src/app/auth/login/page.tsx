"use client"

import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"
import logo from "../../assets/better-auth-logo.png"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { SignInForm } from "@/app/auth/login/sign-in-form"
import { SignUpForm } from "@/app/auth/login/sign-up-form"
import { useEffect } from "react"
import { authClient } from "@/lib/auth/auth-client"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuth = async () => {
      const session = await authClient.getSession();
      if (session?.data != null) {
        router.push('/dashboard');   // If authenticated, redirect to dashboard
      }
    };

    checkAuth();
  }, [router])



  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/login" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Enter into the Application
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Tabs defaultValue="sign-in">
              <TabsList className="w-full mb-10">
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              </TabsList>
              <TabsContent value="sign-up">
                <SignUpForm />
              </TabsContent>
              <TabsContent value="sign-in">
                <SignInForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:flex items-center justify-center">
        <Image
          src={logo}
          alt="Image"
          className="w-1/2 dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
