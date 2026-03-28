"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const name = formData.get("name") as string

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role: isAdmin ? "admin" : "user" }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to send invitation")
        return
      }

      toast.success("Invitation sent!", {
        description: `${name} will receive an email to set their password.`,
      })
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="size-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a New User</DialogTitle>
          <DialogDescription>
            An email will be sent to the address below with a link to set their own password.
            The invite link expires in <strong>1 hour</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full Name</Label>
            <Input
              id="invite-name"
              name="name"
              required
              placeholder="Jane Doe"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="jane@example.com"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="invite-isAdmin"
              checked={isAdmin}
              onCheckedChange={(c) => setIsAdmin(c as boolean)}
              disabled={loading}
            />
            <Label htmlFor="invite-isAdmin">Give Administrator Access</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="gap-2">
              <UserPlus className="size-4" />
              {loading ? "Sending Invite..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
