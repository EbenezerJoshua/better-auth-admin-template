import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from "@/lib/auth/auth"
import {
  ArrowLeft,
  Key,
  LinkIcon,
  Loader2Icon,
  Shield,
  Trash2,
  User,
} from "lucide-react"
import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ProfileUpdateForm } from "./components/profile-update-for"
import { ReactNode, Suspense } from "react"
import { SetPasswordButton } from "./components/set-password-button"
import { ChangePasswordForm } from "./components/change-password-form"
import { SessionManagement } from "./components/session-management"
import { AccountLinking } from "./components/account-linking"
import { AccountDeletion } from "./components/account-deletion"
import { TwoFactorAuth } from "./components/two-factor-auth"
import { PasskeyManagement } from "./components/passkey-management"

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session == null) return redirect("/login")

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      <div className="mb-8">
        <Button variant="ghost" className="mb-6 rounded-full -ml-4 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/dashboard" className="inline-flex items-center">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center space-x-4">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {session.user.image ? (
              <Image
                width={64}
                height={64}
                src={session.user.image}
                alt="User Avatar"
                className="object-cover"
              />
            ) : (
              <User className="size-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex gap-1 justify-between items-start">
              <h1 className="text-3xl font-bold">
                {session.user.name || "User Profile"}
              </h1>
              <Badge>{session.user.role}</Badge>
            </div>
            <p className="text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
      </div>

      <Tabs className="space-y-2" defaultValue="profile">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User />
            <span className="max-sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield />
            <span className="max-sm:hidden">Security</span>
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Key />
            <span className="max-sm:hidden">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <LinkIcon />
            <span className="max-sm:hidden">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="danger">
            <Trash2 />
            <span className="max-sm:hidden">Danger</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileUpdateForm user={session.user} />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <LoadingSuspense>
            <SecurityTab
              email={session.user.email}
              isTwoFactorEnabled={session.user.twoFactorEnabled ?? false}
            />
          </LoadingSuspense>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <LoadingSuspense>
            <SessionsTab currentSessionToken={session.session.token} />
          </LoadingSuspense>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <LoadingSuspense>
            <LinkedAccountsTab />
          </LoadingSuspense>
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <AccountDeletion />
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function LinkedAccountsTab() {
  const accounts = await auth.api.listUserAccounts({ headers: await headers() })
  const nonCredentialAccounts = accounts.filter(
    a => a.providerId !== "credential"
  )

  return (
    <div className="space-y-6">
      <AccountLinking currentAccounts={nonCredentialAccounts} />
    </div>
  )
}

async function SessionsTab({
  currentSessionToken,
}: {
  currentSessionToken: string
}) {
  const sessions = await auth.api.listSessions({ headers: await headers() })

  return (
    <div className="space-y-6">
      <SessionManagement
        sessions={sessions}
        currentSessionToken={currentSessionToken}
      />
    </div>
  )
}

async function SecurityTab({
  email,
  isTwoFactorEnabled,
}: {
  email: string
  isTwoFactorEnabled: boolean
}) {
  const [passkeys, accounts] = await Promise.all([
    auth.api.listPasskeys({ headers: await headers() }),
    auth.api.listUserAccounts({ headers: await headers() }),
  ])

  const hasPasswordAccount = accounts.some(a => a.providerId === "credential")

  return (
    <div className="space-y-6">
      {hasPasswordAccount ? (
        <ChangePasswordForm />
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Set Password</h3>
            <p className="text-sm text-muted-foreground">
              We will send you a password setting email to set up a password.
            </p>
          </div>
          <SetPasswordButton email={email} />
        </div>
      )}
      
      {hasPasswordAccount && (
        <TwoFactorAuth isEnabled={isTwoFactorEnabled} />
      )}

      <PasskeyManagement passkeys={passkeys} />
    </div>
  )
}

function LoadingSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loader2Icon className="size-20 animate-spin" />}>
      {children}
    </Suspense>
  )
}