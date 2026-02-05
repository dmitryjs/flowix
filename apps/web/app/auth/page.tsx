"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const readSession = async () => {
      const { data } = await supabaseBrowser.auth.getSession();
      const email = data.session?.user.email ?? null;
      setSessionEmail(email);
      if (email) {
        window.location.href = "/";
      }
    };
    readSession();

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setSessionEmail(session?.user.email ?? null);
        if (session?.user?.email) {
          window.location.href = "/";
        }
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
      setStatus("Enter the 6-digit code from your email.");
    }

    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setStatus(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    const code = otpCode.trim();
    if (!code) {
      setError("Code is required");
      return;
    }

    setIsLoading(true);
    const { error: verifyError } = await supabaseBrowser.auth.verifyOtp({
      email: trimmedEmail,
      token: code,
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
    } else {
      setStatus("Signed in. Redirecting...");
      window.location.href = "/";
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
        <CardHeader className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground">Flowix</div>
          <CardTitle>Sign in</CardTitle>
          <div className="text-xs text-muted-foreground">Project: Default</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            type="text"
            placeholder="6-digit code"
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value)}
          />
          <Button onClick={handleSendMagicLink} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send code"}
          </Button>
          <Button variant="secondary" onClick={handleVerifyOtp} disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify code"}
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
