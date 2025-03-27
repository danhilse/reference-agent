"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

interface LoginButtonProps {
  onClose?: () => void;
}

export function LoginButton({ onClose }: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      await signIn("okta", {
        callbackUrl: window.location.origin,
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogin} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign in with Okta"
      )}
    </Button>
  );
}
