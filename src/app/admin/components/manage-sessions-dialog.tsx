"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { authClient } from "@/lib/auth/auth-client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Monitor, Trash2 } from "lucide-react"

export function ManageSessionsDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
}) {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadSessions()
    }
  }, [open, userId])

  async function loadSessions() {
    setLoading(true)
    const res = await authClient.admin.listUserSessions({ userId })
    if (res.data) {
      setSessions((res.data as any).sessions || res.data)
    } else if (res.error) {
      toast.error(res.error.message || "Failed to fetch sessions")
    }
    setLoading(false)
  }

  async function revokeSession(sessionToken: string) {
    setActionLoading(sessionToken)
    const res = await authClient.admin.revokeUserSession({ sessionToken })
    if (res.error) {
      toast.error(res.error.message || "Failed to revoke session")
    } else {
      toast.success("Session revoked")
      loadSessions()
    }
    setActionLoading(null)
  }

  async function revokeAll() {
    setActionLoading("all")
    const res = await authClient.admin.revokeUserSessions({ userId })
    if (res.error) {
      toast.error(res.error.message || "Failed to revoke sessions")
    } else {
      toast.success("All sessions revoked")
      loadSessions()
    }
    setActionLoading(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              Manage active sessions for {userName}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg bg-muted/20">
              No active sessions found.
            </p>
          ) : (
            <div className="grid gap-3">
              {sessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                  <div className="flex items-start gap-4">
                    <div className="size-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <Monitor className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {session.userAgent ? (
                          <span className="truncate max-w-[200px] sm:max-w-xs block" title={session.userAgent}>
                            {session.userAgent.split(' ').slice(0, 3).join(' ')}...
                          </span>
                        ) : (
                          `Session #${index + 1}`
                        )}
                      </p>
                      <div className="flex flex-col text-xs text-muted-foreground mt-1 gap-1">
                        <span className="flex items-center gap-1">
                          Created: {new Date(session.createdAt).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          Expires: {new Date(session.expiresAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                    disabled={actionLoading !== null}
                    onClick={() => revokeSession(session.token)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {sessions.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={revokeAll}
                disabled={actionLoading !== null}
              >
                {actionLoading === "all" ? "Revoking..." : "Revoke All Sessions"}
              </Button>
            )}
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
