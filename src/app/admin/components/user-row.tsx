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
import { MoreHorizontal, Shield, User, Calendar, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

export function UserRow({
  user,
  selfId,
}: {
  user: UserWithRole
  selfId: string
}) {
  const { refetch } = authClient.useSession()
  const router = useRouter()
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

  function handleRevokeSessions(userId: string) {
    authClient.admin.revokeUserSessions(
      { userId },
      {
        onError: error => {
          toast.error(error.error.message || "Failed to revoke user sessions")
        },
        onSuccess: () => {
          toast.success("User sessions revoked")
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleImpersonateUser(user.id)}
                  className="gap-2"
                >
                  <Shield className="size-4" />
                  Impersonate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRevokeSessions(user.id)} className="gap-2">
                  <User className="size-4" />
                  Revoke Sessions
                </DropdownMenuItem>
                {user.banned ? (
                  <DropdownMenuItem onClick={() => handleUnbanUser(user.id)} className="gap-2">
                    <User className="size-4" />
                    Unban User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleBanUser(user.id)} className="gap-2">
                    <User className="size-4 text-orange-500" />
                    Ban User
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />

                <AlertDialogTrigger asChild>
                  <DropdownMenuItem variant="destructive" className="gap-2">
                    <MoreHorizontal className="size-4" />
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
    </div>
  )
}