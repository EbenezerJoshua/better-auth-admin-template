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
import { TableRow, TableCell } from "@/components/ui/table"

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
    <>
      <TableRow
        className={`group transition-all hover:bg-muted/50 ${
          isSelf ? "bg-primary/[0.03] hover:bg-primary/[0.05]" : ""
        }`}
      >
        {/* ── User (Avatar, Name, Email) ── */}
        <TableCell className="pl-4 sm:pl-6 align-top sm:align-middle py-4 relative">
          {isSelf && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          )}
          <div className="flex items-center gap-4 w-full min-w-0 pr-4">
            <div className="size-10 sm:size-12 rounded-full overflow-hidden bg-muted/60 flex items-center justify-center shrink-0 border border-background shadow-sm">
              {user.image ? (
                <Image
                  width={48}
                  height={48}
                  src={user.image}
                  alt={user.name}
                  className="object-cover size-full"
                />
              ) : (
                <User className="size-5 text-muted-foreground/70" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate text-[15px] sm:text-base tracking-tight">
                  {user.name || "Anonymous User"}
                </p>
                {isSelf && (
                  <Badge variant="secondary" className="text-[10px] h-4 uppercase font-bold bg-primary/10 text-primary hover:bg-primary/10 border-transparent">
                    You
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="size-3 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>
        </TableCell>

        {/* ── Roles & Status ── */}
        <TableCell className="align-middle py-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px] h-5 uppercase font-bold px-2 py-0 border-transparent shadow-none">
              {user.role}
            </Badge>
            
            {user.banned && (
              <Badge variant="destructive" className="text-[10px] h-5 uppercase font-bold px-2 py-0 border-transparent shadow-none">
                Banned
              </Badge>
            )}

            {!user.emailVerified && (
              <Badge variant="outline" className="text-[10px] h-5 uppercase font-bold text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:bg-amber-950/30 px-2 py-0">
                Unverified
              </Badge>
            )}
          </div>
        </TableCell>

        {/* ── Metadata ── */}
        <TableCell className="align-middle py-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap opacity-80">
            <Calendar className="size-3.5" />
            <span>{new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', day: 'numeric' })}</span>
          </div>
        </TableCell>

        {/* ── Actions menu ── */}
        <TableCell className="text-right pr-4 sm:pr-6 align-top sm:align-middle py-4 sm:py-2">
          {!isSelf && (
            <div className="flex justify-end pr-1 sm:pr-0">
              <UserActionsMenu
                user={user}
                onSetPassword={() => setDialogOpen("password")}
                onUpdateUser={() => setDialogOpen("update")}
                onManageSessions={() => setDialogOpen("sessions")}
                onImpersonate={() => handleImpersonateUser(user.id)}
                onBan={() => handleBanUser(user.id)}
                onUnban={() => handleUnbanUser(user.id)}
                onDelete={() => handleRemoveUser(user.id)}
                onReInvite={() => handleReInvite(user.id)}
              />
            </div>
          )}
        </TableCell>
      </TableRow>

      {/* Dialogs */}
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
    </>
  )
}

function UserActionsMenu({
  user,
  onSetPassword,
  onUpdateUser,
  onManageSessions,
  onImpersonate,
  onBan,
  onUnban,
  onDelete,
  onReInvite
}: {
  user: UserWithRole
  onSetPassword: () => void
  onUpdateUser: () => void
  onManageSessions: () => void
  onImpersonate: () => void
  onBan: () => void
  onUnban: () => void
  onDelete: () => void
  onReInvite: () => void
}) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={onUpdateUser} className="gap-2">
            <Edit2 className="size-4" />
            Update Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSetPassword} className="gap-2">
            <KeyRound className="size-4" />
            Set Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onManageSessions} className="gap-2">
            <Monitor className="size-4" />
            Manage Sessions
          </DropdownMenuItem>

          {/* Re-invite: only visible for invited-but-not-yet-active users */}
          {(user as any).invitePending && !user.emailVerified && (
            <DropdownMenuItem
              onClick={onReInvite}
              className="gap-2 text-amber-600 focus:text-amber-700 focus:bg-amber-50"
            >
              <MailPlus className="size-4" />
              Re-send Invite
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={onImpersonate}
            className="gap-2 group"
          >
            <Shield className="size-4 group-hover:text-primary transition-colors" />
            Impersonate
          </DropdownMenuItem>
          
          {user.banned ? (
            <DropdownMenuItem onClick={onUnban} className="gap-2">
              <User className="size-4 text-green-600" />
              <span className="text-green-600">Unban User</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onBan} className="gap-2">
              <UserRoundX className="size-4 text-amber-600" />
              <span className="text-amber-600">Ban User</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />

          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
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
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}