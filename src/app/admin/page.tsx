import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth/auth"
import { ArrowLeft, Users } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { UserRow } from "./components/user-row"
import { authClient } from "@/lib/auth/auth-client"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session == null) return redirect("/auth/login")

  const hasAdminAccess = await auth.api.userHasPermission({
    headers: await headers(),
    body: { permissions: { user: ["list", "ban", "impersonate", "delete",], session: ["revoke"]}},
  })

  if (!hasAdminAccess.success) return redirect("/")

  const users = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      <div className="mb-8">
        <Button variant="ghost" className="mb-6 rounded-full -ml-4 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/dashboard" className="inline-flex items-center text-sm">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="size-8 text-primary" />
              Users ({users.total})
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage user accounts, roles, and permissions across the platform
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {users.users.map(user => (
          <UserRow key={user.id} user={user} selfId={session.user.id} />
        ))}
        {users.users.length === 0 && (
          <div className="text-center py-12 border rounded-xl bg-card">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        )}
      </div>
    </div>
  )
}