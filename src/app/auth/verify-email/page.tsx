"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ---------------- Types ---------------- */

type PendingVerification = {
  email: string;
  createdAt: number;
};

/* ---------------- Constants ---------------- */

const STORAGE_KEY = "pending_verification_email";
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const POLLING_INTERVAL_MS = 3000;

/* ---------------- Page ---------------- */

export default function VerifyEmailPage() {
  const router = useRouter();

  const [pending, setPending] =
    useState<PendingVerification | null>(null);

  const [checking, setChecking] = useState(true);

  /* ---------- Load pending email from sessionStorage ---------- */
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed: PendingVerification = JSON.parse(raw);

      // ⏱ Expiry check
      if (Date.now() - parsed.createdAt > EXPIRY_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.replace("/auth/login");
        return;
      }

      setPending(parsed);
      setChecking(false);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      router.replace("/auth/login");
    }
  }, [router]);

  /* ---------- Poll for email verification ---------- */
  useEffect(() => {
    if (!pending) return;

    const interval = setInterval(async () => {
      const session = await authClient.getSession();

      if (session && session?.data?.user?.emailVerified) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.replace("/dashboard");
      }
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pending, router]);

  /* ---------- Resend verification email ---------- */
  const resendVerification = async () => {
    if (!pending) return;

    const res = await authClient.sendVerificationEmail({
      email: pending.email,
      callbackURL: "/dashboard",
    });

    if (res?.error) {
      toast.error(res.error.message || "Failed to resend email");
    } else {
      toast.success("Verification email sent!");
    }
  };

  if (checking || !pending) return null;

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">
        Verify your email
      </h1>

      <p className="mb-4">
        We’ve sent a verification link to{" "}
        <strong>{pending.email}</strong>.
      </p>

      <p className="text-sm text-muted-foreground mb-6">
        This page will update automatically once your email is verified.
      </p>

      <Button variant="outline" onClick={resendVerification}>
        Resend Verification Email
      </Button>
    </div>
  );
}
