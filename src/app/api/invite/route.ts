import { auth } from "@/lib/auth/auth"
import { db } from "@/db/drizzle"
import * as schema from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

/**
 * POST /api/invite
 *
 * Handles two use cases:
 *   1. New invite  — body: { email, name, role }
 *   2. Re-invite   — body: { userId }
 *
 * The invite link is a standard password-reset token.
 * auth.ts routes sendResetPassword to sendInviteEmail when
 * the user has invitePending = true.
 */
export async function POST(req: NextRequest) {
  const reqHeaders = req.headers

  // ── 1. Auth guard — must be a signed-in admin ─────────────────────────────

  const session = await auth.api.getSession({ headers: reqHeaders })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const permission = await auth.api.userHasPermission({
    headers: reqHeaders,
    body: { permissions: { user: ["create"] } },
  })

  if (!permission.success) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { email, name, role, userId } = body

  // ── 2. Re-invite flow (userId provided) ────────────────────────────────────

  if (userId) {
    // Look up the user's email directly from the database
    const existingUser = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Re-send the invite by triggering a password reset.
    // The sendResetPassword hook in auth.ts detects invitePending = true
    // and sends the invitation email instead of the normal reset email.
    await auth.api.requestPasswordReset({
      body: {
        email: existingUser.email,
        redirectTo: "/reset-password",
      },
      headers: reqHeaders,
    })

    return NextResponse.json({ success: true })
  }

  // ── 3. New invite flow ──────────────────────────────────────────────────────

  if (!email || !name) {
    return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
  }

  // Create the user with a random temp password and invitePending = true.
  // The user will replace this through the invite link — they never know this password.
  const tempPassword = crypto.randomBytes(32).toString("hex")

  let createdUserEmail = email
  try {
    await auth.api.createUser({
      body: {
        email,
        name,
        password: tempPassword,
        role: role || "user",
        data: { invitePending: true },
      },
      headers: reqHeaders,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create user" },
      { status: 400 }
    )
  }

  // Trigger the password-reset flow to generate a signed token.
  // auth.ts routes this to sendInviteEmail because invitePending = true.
  await auth.api.requestPasswordReset({
    body: {
      email,
      redirectTo: "/reset-password",
    },
    headers: reqHeaders,
  })

  return NextResponse.json({ success: true })
}
