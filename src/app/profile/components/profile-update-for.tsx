"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { useState } from "react"
import { LoadingSwap } from "@/components/auth/loading-swap"

const nameUpdateSchema = z.object({
  name: z.string().min(1),
})

const emailUpdateSchema = z.object({
  email: z.email().min(1),
})

export function ProfileUpdateForm({
  user,
}: {
  user: {
    email: string
    name: string
  }
}) {
  const router = useRouter()
  const [isNameOpen, setIsNameOpen] = useState(false)
  const [isEmailOpen, setIsEmailOpen] = useState(false)

  const nameForm = useForm<z.infer<typeof nameUpdateSchema>>({
    resolver: zodResolver(nameUpdateSchema),
    defaultValues: { name: user.name },
  })

  const emailForm = useForm<z.infer<typeof emailUpdateSchema>>({
    resolver: zodResolver(emailUpdateSchema),
    defaultValues: { email: user.email },
  })

  async function handleNameUpdate(data: z.infer<typeof nameUpdateSchema>) {
    const { error } = await authClient.updateUser({
      name: data.name,
    })

    if (error) {
      toast.error(error.message || "Failed to update name")
    } else {
      toast.success("Name updated successfully")
      setIsNameOpen(false)
      router.refresh()
    }
  }

  async function handleEmailUpdate(data: z.infer<typeof emailUpdateSchema>) {
    const { error } = await authClient.changeEmail({
      newEmail: data.email,
      callbackURL: "/profile",
    })

    if (error) {
      toast.error(error.message || "Failed to change email")
    } else {
      toast.success("Verify your new email address to complete the change.")
      setIsEmailOpen(false)
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Name</CardTitle>
            <CardDescription>{user.name || "No name set"}</CardDescription>
          </div>
          <Dialog open={isNameOpen} onOpenChange={setIsNameOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-36">Change Name</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Name</DialogTitle>
                <DialogDescription>
                  Enter your new name below.
                </DialogDescription>
              </DialogHeader>
              <Form {...nameForm}>
                <form
                  className="space-y-4"
                  onSubmit={nameForm.handleSubmit(handleNameUpdate)}
                >
                  <FormField
                    control={nameForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={nameForm.formState.isSubmitting} className="w-full">
                    <LoadingSwap isLoading={nameForm.formState.isSubmitting}>Update Name</LoadingSwap>
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0 w-full sm:w-auto">
            <CardTitle>Email address</CardTitle>
            <CardDescription className="truncate">{user.email}</CardDescription>
          </div>
          <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-36 shrink-0">Change Email</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Email</DialogTitle>
                <DialogDescription>
                  Enter your new email address below. We will send a verification link.
                </DialogDescription>
              </DialogHeader>
              <Form {...emailForm}>
                <form
                  className="space-y-4"
                  onSubmit={emailForm.handleSubmit(handleEmailUpdate)}
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={emailForm.formState.isSubmitting} className="w-full">
                    <LoadingSwap isLoading={emailForm.formState.isSubmitting}>Update Email</LoadingSwap>
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>
    </div>
  )
}