"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { appConfig } from "@/config";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const error =
    formError ||
    (urlError === "INVALID_TOKEN"
      ? "Your magic link is invalid or has expired. Please request a new one."
      : urlError === "magic_link_expired"
        ? "Your magic link has expired. Please request a new one."
        : urlError === "magic_link_invalid"
          ? "Your magic link is invalid. Please request a new one."
          : urlError
            ? "An error occurred during sign in. Please try again."
            : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailResult = z
      .email("Please enter a valid email address.")
      .safeParse(email);
    if (!emailResult.success) {
      setFormError(emailResult.error.issues[0].message);
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const { error: authError } = await authClient.signIn.magicLink({
        email,
        callbackURL: "/dashboard",
        errorCallbackURL: "/",
      });

      if (authError) {
        setFormError(
          authError.message || "Failed to send magic link. Please try again.",
        );
      } else {
        setSent(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-start space-y-6 mb-8 w-full">
        {/* Logo Icon */}
        <Logo width={60} height={60} />

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to {appConfig.name}
          </h2>
        </div>
      </div>

      <div className="w-full">
        {sent ? (
          <div>
            <p className="text-sm text-foreground-muted">
              Check your email! We sent a secure sign-in link to{" "}
              <span className="font-bold">{email}</span>. Click the link to log
              in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className={cn(
                buttonVariants({
                  variant: "default",
                }),
                "w-full",
              )}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Send Magic Link</span>
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              If you don&apos;t have an account, one will be automatically
              created for you.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
