"use client"

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SessionManager() {

    const router = useRouter()
    const [sessions, setSessions] = useState<any[]>([])

    const handleRevokeSessions = async () => {
        try {
            await authClient.revokeSessions();
            setSessions([])
            await authClient.signOut();
            router.push("/login")
            toast.success("All Sessions revoked successfully")
        } catch (error) {
            const e = error as Error
            console.log(e.message)
            toast.error(e.message)
        }
    }

    const handleRevokeSingleSession = async (sessionToken: string, isCurrent: boolean) => {
        try {
            toast.success("Session revoked successfully")
            router.refresh()
            
            if (isCurrent) {
                router.push("/login")
            } else {
                await fetchSessions()
            }
        } catch (error) {
            const e = error as Error
            console.log(e.message)
            toast.error(e.message)
        }
    }

    const fetchSessions = async () => {
        try {
            const res = await authClient.listSessions()
            if (res.data) {
                setSessions(res.data)
            } else {
                console.error("Unexpected response structure:", res)
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error)
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])
    

    return (
        <div className="space-y-4 max-w-md mx-auto my-10">
            <div className="flex justify-end">
                <Button variant="outline" onClick={handleRevokeSessions} className="text-destructive border-destructive hover:bg-destructive/10">
                    Revoke All Sessions <LogOut className="ml-2 size-4" />
                </Button>
            </div>
            
            <div className="grid gap-4">
                {sessions === null && <p className="text-muted-foreground">No sessions found</p>}
                {sessions !== null && sessions.map((session) => (
                    <div 
                        key={session.id} 
                        className={`p-4 rounded-lg border ${session.isCurrentSession ? "border-green-500/50 bg-green-500/5" : "border-border bg-card"}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{session.userAgent}</p>
                                    {session.isCurrentSession && (
                                        <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                            Active Now
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground space-y-0.5">
                                    <p className="font-mono text-xs opacity-70">ID: {session.id}</p>
                                    <p>Expires: {new Date(session.expiresAt).toLocaleDateString()} {new Date(session.expiresAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRevokeSingleSession(session.token, session.isCurrentSession)}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <LogOut className="size-4" />
                                <span className="sr-only">Revoke</span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    )
}