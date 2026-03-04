"use client"

import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LogOut, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function parseUserAgent(userAgent: string) {
    let os = "Unknown Device";
    let browser = "Web Browser";
    let isMobile = false;

    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "MacOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) {
        os = "Android";
        isMobile = true;
    }
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
        os = "iOS";
        isMobile = true;
    }

    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) browser = "Chrome";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Edg")) browser = "Edge";

    return { os, browser, isMobile };
}

export function SessionManager() {
    const router = useRouter()

    // Get the strictly *current* session directly from better-auth hook
    const { data: currentSessionData } = authClient.useSession();

    const [sessions, setSessions] = useState<any[]>([])

    const fetchSessions = async () => {
        try {
            const res = await authClient.listSessions()
            if (res.data) {
                setSessions(res.data)
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error)
        }
    }

    // Run this once when the page opens, and set up auto-refresh
    useEffect(() => {
        fetchSessions()

        // Auto-refresh the list every 15 seconds so changes on other devices 
        // reflect here automatically without manually refreshing the page.
        // const interval = setInterval(() => {
        //     fetchSessions()
        // }, 15000)

        // Also fetch immediately if the user switches tabs and comes back
        const handleFocus = () => {
            fetchSessions()
        }
        window.addEventListener("focus", handleFocus)

        return () => {
            // clearInterval(interval)
            window.removeEventListener("focus", handleFocus)
        }
    }, [])

    // Log out of all devices at once
    const handleRevokeAllSessions = async () => {
        try {
            await authClient.revokeSessions();
            setSessions([])
            await authClient.signOut();
            toast.success("Successfully logged out of all devices.")
            router.push("/auth/login")
        } catch (error: any) {
            toast.error(error.message || "Failed to log out of all devices.")
        }
    }

    // Log out of a specific device
    const handleRevokeSingleSession = async (sessionToken: string, isCurrent: boolean) => {
        try {
            await authClient.revokeSession({ token: sessionToken });
            toast.success("Logged out of that device.")

            // If they logged out of their current device, send them to login page immediately
            if (isCurrent) {
                await authClient.signOut();
                router.push("/auth/login")
            } else {
                // Otherwise just refresh the list of remaining sessions
                await fetchSessions()
                router.refresh()
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to log out of the device.")
        }
    }

    return (
        <Card className="max-w-xl mx-auto my-10 shadow-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Session Manager</CardTitle>
                <CardDescription>
                    Manage the devices that are currently logged into your account.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {sessions.length === 0 && <p className="text-muted-foreground text-sm">No active sessions found.</p>}

                {sessions.map((session) => {
                    // Check if this particular session equals the direct current session
                    const isCurrentSession = currentSessionData?.session?.token === session.token;

                    // Extract OS, browser, and mobile status from the userAgent string
                    const { os, browser, isMobile } = parseUserAgent(session.userAgent || "")

                    return (
                        <div
                            key={session.id}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isCurrentSession ? "border-green-500/50 bg-green-500/5" : "border-border bg-card"}`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Show a different icon based on if it's a mobile phone or computer */}
                                <div className={`p-2 rounded-full ${isCurrentSession ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'}`}>
                                    {isMobile ? <Smartphone className="size-5" /> : <Monitor className="size-5" />}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        {/* Display the nice system name instead of the raw user agent string */}
                                        <p className="font-medium text-foreground">
                                            {os} - {browser}
                                        </p>

                                        {/* Label the user's current device */}
                                        {isCurrentSession && (
                                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                                This Session
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                                        <p>Signed in: {new Date(session.createdAt || session.updatedAt || session.expiresAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeSingleSession(session.token, isCurrentSession)}
                                className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="Log out from this device"
                            >
                                <LogOut className="size-4" />
                            </Button>
                        </div>
                    )
                })}
            </CardContent>

            <CardFooter className="pt-6 border-t bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-xl">
                <p className="text-xs text-muted-foreground">
                    If you see a device you don't recognize, log it out immediately.
                </p>
                <Button
                    variant="destructive"
                    onClick={handleRevokeAllSessions}
                    className="w-full sm:w-auto shadow-sm"
                >
                    Log Out of All Devices
                </Button>
            </CardFooter>
        </Card>
    )
}