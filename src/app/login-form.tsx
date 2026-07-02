"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { FormError } from "@/components/ui/form-error";

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
    <Card className="w-full max-w-md bg-slate-900/60 border-slate-800 backdrop-blur-xl shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          HOA Document Dropdox
        </CardTitle>
        <CardDescription className="text-slate-400">
          Sign in or create your manager account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="inline-block p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Check your email</h3>
            <p className="text-sm text-slate-400">
              We sent a secure sign-in link to{" "}
              <span className="font-semibold text-slate-200">{email}</span>.
              Check your inbox and click the link to log in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-primary focus-visible:border-primary"
                required
                disabled={loading}
              />
            </div>
            {error && <FormError>{error}</FormError>}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-foreground font-medium py-6 rounded-lg transition-all duration-200 shadow-lg shadow-white/5 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Send Magic Link</span>
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
