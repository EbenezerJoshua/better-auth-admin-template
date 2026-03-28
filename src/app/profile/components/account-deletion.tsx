"use client"

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button"
import { authClient } from "@/lib/auth/auth-client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function AccountDeletion() {
  return (
    <Card className="border-destructive/50 shadow-sm overflow-hidden pb-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Deleting your account is irreversible. All your sessions, linked accounts, and personal information will be permanently removed from our servers.
        </p>
      </CardContent>

      <CardFooter className="p-6 bg-destructive/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <p className="text-xs text-muted-foreground font-medium text-destructive/80">
          This action cannot be undone. Please be certain.
        </p>
        <BetterAuthActionButton
          requireAreYouSure
          variant="destructive"
          className="w-full sm:w-auto shadow-sm"
          successMessage="Account deletion initiated. Please check your email to confirm."
          action={() => authClient.deleteUser({ callbackURL: "/login" })}
        >
          Delete Account
        </BetterAuthActionButton>
      </CardFooter>
    </Card>
  )
}