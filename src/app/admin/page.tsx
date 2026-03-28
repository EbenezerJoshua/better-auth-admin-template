import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth/auth"
import { ArrowLeft, Users } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { InviteUserDialog } from "./components/invite-user-dialog"
import { UserListClient } from "./components/user-list-client"
import { PageTransition } from "@/components/ui/page-transition"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session == null) return redirect("/auth/login")

  const hasAdminAccess = await auth.api.userHasPermission({
    headers: await headers(),
    body: { permissions: { user: ["list", "ban", "impersonate", "delete", "create", "set-password", "update"], session: ["list", "revoke"]}},
  })

  if (!hasAdminAccess.success) return redirect("/")

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto my-6 px-4">
        <div className="mb-8">
          <Button variant="ghost" className="mb-6 rounded-full -ml-4 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/dashboard" className="inline-flex items-center text-sm">
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="size-8 text-primary" />
                Users
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Manage user accounts, roles, and permissions across the platform
              </p>
            </div>
            <InviteUserDialog />
          </div>
        </div>

        <UserListClient selfId={session.user.id} />
      </div>
    </PageTransition>
  )
}