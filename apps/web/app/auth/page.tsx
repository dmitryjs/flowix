"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const readSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      setSessionEmail(data.session?.user.email ?? null);
    };
    readSession();

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setSessionEmail(session?.user.email ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSendMagicLink = async () => {
    setError(null);
    setStatus(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabaseBrowser.auth.signInWithOtp({
      email: trimmedEmail,
    });

    if (authError) {
      setError(authError.message);
    } else {
      setStatus("Check your email for the magic link");
    }

    setIsLoading(false);
  };

  const handleLogout = async () => {
    setError(null);
    setStatus(null);
    await supabaseBrowser.auth.signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button onClick={handleSendMagicLink} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send magic link"}
          </Button>

          {sessionEmail && (
            <div className="text-sm text-muted-foreground">
              Logged in as: {sessionEmail}
            </div>
          )}
          {sessionEmail && (
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          )}

          {status && <div className="text-sm text-muted-foreground">{status}</div>}
          {error && <div className="text-sm text-destructive">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
