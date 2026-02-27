"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { SessionManager } from "./components/session-manager";

export default function DashboardPage() {

    const {data: session, isPending: loading} = authClient.useSession();
    const router = useRouter();

    if(!session && !loading) {
        router.push("/auth/login");
        return null;
    }

    if(loading) {
        return <div>Loading...</div>;
    }

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/auth/login");
    }

    return (
        <div className="text-center mt-20">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome to your dashboard!</p>
            {session ? (
                <div className="mt-4">
                    <p className="mb-2">You are logged in as: <strong>{session.user.name}</strong></p>
                    <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
                </div>
            ) : null}
            <h2 className="mt-8">Here are your Sessions of your account</h2>
            <SessionManager />
        </div>
    );
}

