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
import { PasswordInput } from "@/components/ui/password-input"
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    authClient.admin.createUser(
      { name, email, password, role: isAdmin ? "admin" : "user" },
      {
        onSuccess: () => {
          toast.success("User created successfully")
          setOpen(false)
          router.refresh()
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to create user")
        },
      }
    ).finally(() => setLoading(false))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Name</Label>
            <Input id="create-name" name="name" required placeholder="John Doe" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input id="create-email" name="email" type="email" required placeholder="john@example.com" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">Password</Label>
            <PasswordInput id="create-password" name="password" required disabled={loading} minLength={8} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="create-isAdmin" checked={isAdmin} onCheckedChange={(c) => setIsAdmin(c as boolean)} disabled={loading} />
            <Label htmlFor="create-isAdmin">Give Administrator Access</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
