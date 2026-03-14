"use client"

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button"
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export function PasskeyButton() {
  const router = useRouter()
  const { refetch } = authClient.useSession()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    authClient.signIn.passkey(
      { autoFill: true },
      {
        onSuccess() {
          refetch()
          router.push("/dashboard")
        },
        onError(ctx) {
          // Ignore AbortError specifically as it's common with autoFill and re-renders
          if (ctx.error.message?.includes("abort signal") || ctx.error.message?.includes("AbortError")) {
            return
          }
        },
      }
    )
  }, [router, refetch])

  return (
    <BetterAuthActionButton
      variant="outline"
      className="w-full"
      action={async () => {
        const res = await authClient.signIn.passkey(undefined, {
          onSuccess() {
            refetch()
            router.push("/dashboard")
          },
        })

        // Catch the AbortError (caused by 1Password/browser cancelling the background autoFill)
        // and return a null error to prevent the UI from showing a failure toast.
        const isAbortError =
          res?.error?.message?.includes("abort signal") ||
          res?.error?.message?.includes("AbortError")

        if (isAbortError) {
          return { error: null }
        }

        return res as any
      }}
    >
      Use Passkey
    </BetterAuthActionButton>
  )
}
