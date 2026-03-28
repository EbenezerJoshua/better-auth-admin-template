"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export function UpdateUserDialog({
  open,
  onOpenChange,
  userId,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  user: { name: string; role: string }
}) {
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsAdmin(user.role === "admin")
  }, [user.role, open])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    let hasError = false;

    if (name !== user.name) {
      const res = await authClient.admin.updateUser({ userId, data: { name } })
      if (res.error) {
        toast.error(res.error.message || "Failed to update name")
        hasError = true
      }
    }
    
    const targetRole = isAdmin ? "admin" : "user"
    if (!hasError && targetRole !== user.role) {
      const res = await authClient.admin.setRole({ userId, role: targetRole })
      if (res.error) {
        toast.error(res.error.message || "Failed to update role")
        hasError = true
      }
    }
    
    setLoading(false)
    if (!hasError) {
      toast.success("User updated successfully")
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Update the identity and role of this user.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-name">Name</Label>
            <Input id="update-name" name="name" defaultValue={user.name} required disabled={loading} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="update-admin-role" checked={isAdmin} onCheckedChange={(c) => setIsAdmin(c as boolean)} disabled={loading} />
            <Label htmlFor="update-admin-role">Administrator Access</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
