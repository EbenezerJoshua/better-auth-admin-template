"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth/auth-client"
import { UserWithRole } from "better-auth/plugins/admin"
import { MoreHorizontal, Shield, User, Calendar, Mail, Trash2, UserRoundX, Edit2, KeyRound, Monitor, MailPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { useState } from "react"
import { SetPasswordDialog } from "./set-password-dialog"
import { UpdateUserDialog } from "./update-user-dialog"
import { ManageSessionsDialog } from "./manage-sessions-dialog"

export function UserRow({
  user,
  selfId,
}: {
  user: UserWithRole
  selfId: string
}) {
  const { refetch } = authClient.useSession()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState<"password" | "update" | "sessions" | null>(null)
  const isSelf = user.id === selfId

  function handleImpersonateUser(userId: string) {
    authClient.admin.impersonateUser(
      { userId },
      {
        onError: error => {
          toast.error(error.error.message || "Failed to impersonate")
        },
        onSuccess: () => {
          refetch()
          router.push("/")
        },
      }
    )
  }

  function handleBanUser(userId: string) {
    authClient.admin.banUser(
      { userId },
      {
        onError: error => {
          toast.error(error.error.message || "Failed to ban user")
        },
        onSuccess: () => {
          toast.success("User banned")
          router.refresh()
        },
      }
    )
  }

  function handleUnbanUser(userId: string) {
    authClient.admin.unbanUser(
      { userId },
      {
        onError: error => {
          toast.error(error.error.message || "Failed to unban user")
        },
        onSuccess: () => {
          toast.success("User unbanned")
          router.refresh()
        },
      }
    )
  }

  function handleRemoveUser(userId: string) {
    authClient.admin.removeUser(
      { userId },
      {
        onError: error => {
          toast.error(error.error.message || "Failed to delete user")
        },
        onSuccess: () => {
          toast.success("User deleted")
          router.refresh()
        },
      }
    )
  }

  async function handleReInvite(userId: string) {
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      toast.success("Invitation re-sent", { description: "A new invite link has been emailed." })
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to re-send invitation")
    }
  }

  return (
    <div
      key={user.id}
      className={`flex items-center justify-between p-4 rounded-xl border bg-card transition-all hover:border-primary/50 ${isSelf ? "border-primary/30 bg-primary/5" : "border-border"}`}
    >
      <div className="flex items-center gap-4">
        <div className="size-12 bg-muted rounded-full flex items-center justify-center overflow-hidden border-2 border-background shadow-sm">
          {user.image ? (
            <Image
              width={48}
              height={48}
              src={user.image}
              alt={user.name}
              className="object-cover"
            />
          ) : (
            <User className="size-6 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground leading-none">
              {user.name || "Anonymous User"}
            </p>
            {isSelf && (
              <Badge variant="secondary" className="text-[10px] h-4 uppercase font-bold bg-primary/10 text-primary hover:bg-primary/10 border-none">
                You
              </Badge>
            )}
            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px] h-4 uppercase font-bold">
              {user.role}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="size-3" />
              {user.email}
              {!user.emailVerified && (
                <span className="text-[10px] text-orange-500 font-medium ml-1 bg-orange-500/10 px-1.5 py-0.5 rounded-full border border-orange-500/20">
                  Unverified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              Joined {new Date(user.createdAt).toLocaleDateString('en-GB')}
            </div>
          </div>
          
          {user.banned && (
            <div className="mt-1">
              <Badge variant="destructive" className="text-[10px] h-4 uppercase font-bold">
                Banned
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isSelf && (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <MoreHorizontal className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setDialogOpen("update")} className="gap-2">
                  <Edit2 className="size-4" />
                  Update User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogOpen("password")} className="gap-2">
                  <KeyRound className="size-4" />
                  Set Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDialogOpen("sessions")} className="gap-2">
                  <Monitor className="size-4" />
                  Manage Sessions
                </DropdownMenuItem>

                {/* Re-invite: only visible for invited-but-not-yet-active users */}
                {(user as any).invitePending && !user.emailVerified && (
                  <DropdownMenuItem
                    onClick={() => handleReInvite(user.id)}
                    className="gap-2 text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                  >
                    <MailPlus className="size-4" />
                    Re-send Invite
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => handleImpersonateUser(user.id)}
                  className="gap-2"
                >
                  <Shield className="size-4" />
                  Impersonate
                </DropdownMenuItem>
                {user.banned ? (
                  <DropdownMenuItem onClick={() => handleUnbanUser(user.id)} className="gap-2">
                    <User className="size-4" />
                    Unban User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleBanUser(user.id)} className="gap-2">
                    <UserRoundX className="size-4 text-orange-500" />
                    Ban User
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />

                <AlertDialogTrigger asChild>
                  <DropdownMenuItem variant="destructive" className="gap-2">
                    <Trash2 className="size-4" />
                    Delete User
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong>{user.name}</strong>? This action cannot
                  be undone and will remove all their data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleRemoveUser(user.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <SetPasswordDialog 
        open={dialogOpen === "password"} 
        onOpenChange={(open) => !open && setDialogOpen(null)} 
        userId={user.id} 
        userName={user.name || "Anonymous User"} 
      />
      
      <UpdateUserDialog 
        open={dialogOpen === "update"} 
        onOpenChange={(open) => !open && setDialogOpen(null)} 
        userId={user.id} 
        user={{ name: user.name || "", role: user.role || "user" }} 
      />
      
      <ManageSessionsDialog 
        open={dialogOpen === "sessions"} 
        onOpenChange={(open) => !open && setDialogOpen(null)} 
        userId={user.id} 
        userName={user.name || "Anonymous User"} 
      />
    </div>
  )
}