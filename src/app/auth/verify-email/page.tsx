"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

/* ================= Types ================= */

type PendingVerification = {
  email: string;
  createdAt: number;
  lastResentAt?: number;
};

/* ================= Constants ================= */

const STORAGE_KEY = "pending_verification_email";
const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const POLLING_INTERVAL_MS = 3000;

/* ================= Page ================= */

export default function VerifyEmailPage() {
  const router = useRouter();

  const [pending, setPending] =
    useState<PendingVerification | null>(null);

  const [checking, setChecking] = useState(true);
  const [cooldown, setCooldown] = useState(30);

  /* ---------- Load pending verification ---------- */
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) {
      router.replace("/auth/login");
      return;
    }

    try {
      const parsed: PendingVerification = JSON.parse(raw);

      // Expired verification session
      if (Date.now() - parsed.createdAt > EXPIRY_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.replace("/auth/login");
        return;
      }

      // Restore resend cooldown
      if (parsed.lastResentAt) {
        const elapsed = Date.now() - parsed.lastResentAt;
        const remaining = Math.max(
          0,
          Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
        );
        setCooldown(remaining);
      }

      setPending(parsed);
      setChecking(false);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      router.replace("/auth/login");
    }
  }, [router]);

  /* ---------- Poll for verification completion ---------- */
  useEffect(() => {
    if (!pending) return;

    const interval = setInterval(async () => {
      const session = await authClient.getSession();

      if (session?.data?.user?.emailVerified) {
        sessionStorage.removeItem(STORAGE_KEY);
        router.replace("/dashboard");
      }
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pending, router]);

  /* ---------- Cooldown countdown ---------- */
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /* ---------- Resend verification ---------- */
  const resendVerification = async () => {
    if (!pending || cooldown > 0) return;
    toast("Requesting another verification email...");
    setCooldown(RESEND_COOLDOWN_MS / 1000);

    const res = await authClient.sendVerificationEmail({
      email: pending.email,
      callbackURL: "/dashboard",
    });

    if (res?.error) {
      toast.error(res.error.message || "Failed to resend email");
      return;
    }

    toast.success("Verification email sent!");

    const updated: PendingVerification = {
      ...pending,
      lastResentAt: Date.now(),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPending(updated);
  };

  if (checking || !pending) return null;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            A verification link has been sent to <strong className="text-foreground">{pending.email}</strong>.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-6 text-center">
          <p className="text-sm text-muted-foreground">
            This page will update automatically once your email is verified.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={resendVerification}
            disabled={cooldown > 0}
          >
            {cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend Verification Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}