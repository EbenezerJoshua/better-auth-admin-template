"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SessionManager } from "./components/session-manager";
import Link from "next/link";

export default function DashboardPage() {

    const { data: session, isPending: loading } = authClient.useSession();
    const router = useRouter();

    useEffect(() => {
        // Poll every 15 seconds to see if the session is still valid
        // 15 seconds is a much better balance for server load than 5 seconds.
        // const interval = setInterval(async () => {
        //     const { data, error } = await authClient.getSession();
        //     if (error || !data) {
        //         router.push("/auth/login");
        //     }
        // }, 15000); // 15 seconds

        // Add event listener for window focus to check immediately when coming back
        const handleFocus = async () => {
            const { data, error } = await authClient.getSession();
            if (error || !data) {
                router.push("/auth/login");
            }
        };
        window.addEventListener("focus", handleFocus);

        return () => {
            // clearInterval(interval);
            window.removeEventListener("focus", handleFocus);
        };
    }, [router]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!session && !loading) {
            router.push("/auth/login");
        }
    }, [session, loading, router]);

    // Show nothing while redirecting
    if (!session && !loading) {
        return null;
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/auth/login");
    }



    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Account Dashboard
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Welcome back! Manage your active sessions, reset your password, and control your device access.
                    </p>
                </div>

                {/* Profile Overview Card */}
                {session ? (
                    <div className="max-w-xl mx-auto w-full p-6 border rounded-xl bg-card text-card-foreground shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Logged in as</p>
                            <p className="text-xl font-semibold mt-1">{session.user.name}</p>
                            <p className="text-sm text-muted-foreground">{session.user.email}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Button variant="outline" asChild>
                                <Link href="/auth/update-password">Update Password</Link>
                            </Button>
                            <Button variant="destructive" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </div>
                    </div>
                ) : null}

                {/* Sessions Section */}
                <div className="pt-8 border-t">
                    <SessionManager />
                </div>
            </div>
        </div>
    );
}

