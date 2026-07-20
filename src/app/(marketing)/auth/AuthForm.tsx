"use client";

import { createClient } from "@/utils/supabase/client";
import { demoSignIn, linkSharedGalleryAction } from "@/app/actions/auth";
import {
  DEMO_ACCOUNTS,
  intentFromRole,
  roleFromIntent,
  type UserRole,
} from "@/lib/demo-auth";
import { galleryTokenFromPath } from "@/lib/buyer-galleries";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Mode = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M12 1h10v10H12z" />
      <path fill="#7fba00" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}

type OAuthProvider = "google" | "azure";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent");
  const nextPath = searchParams.get("next") || "/dashboard";
  const isInvite = searchParams.get("invite") === "1" || nextPath.startsWith("/g/");
  const [mode, setMode] = useState<Mode>(
    (searchParams.get("mode") as Mode) || (isInvite ? "signup" : "signin")
  );
  const [role, setRole] = useState<UserRole>(
    isInvite ? "buyer" : roleFromIntent(intentParam) ?? "seller"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<OAuthProvider | null>(
    null
  );
  const [demoPending, startDemo] = useTransition();
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const isSignUp = mode === "signup";
  const callbackError = searchParams.get("error");
  const intent = intentFromRole(role);

  const intentLabel = isInvite
    ? "Create a buyer account to open the seller inventory you were invited to."
    : role === "seller"
      ? "Sign in to list devices and share private galleries."
      : "Sign in to open shared inventory links and place bids.";

  async function finishAuth(destination: string, authRole: UserRole) {
    if (authRole === "buyer") {
      const token = galleryTokenFromPath(destination);
      if (token) {
        await linkSharedGalleryAction(token);
      }
    }
    router.push(
      destination === "/dashboard" ? `/dashboard/${authRole}` : destination
    );
    router.refresh();
  }

  async function handleOAuthSignIn(provider: OAuthProvider) {
    setMessage(null);
    setOauthProvider(provider);

    const label = provider === "google" ? "Google" : "Microsoft";

    try {
      const supabase = createClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set("next", nextPath);
      redirectTo.searchParams.set("intent", intent);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo.toString(),
          ...(provider === "google"
            ? {
                queryParams: {
                  access_type: "offline",
                  prompt: "consent",
                },
              }
            : {
                // Allow work/school and personal Microsoft accounts
                scopes: "email openid profile",
                queryParams: {
                  prompt: "select_account",
                },
              }),
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      let text = `${label} sign-in failed.`;
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (
          msg.includes("provider is not enabled") ||
          msg.includes("unsupported provider")
        ) {
          text =
            provider === "google"
              ? "Google sign-in is not enabled yet. Turn on the Google provider in your Supabase Auth settings."
              : "Microsoft sign-in is not enabled yet. Turn on the Azure (Microsoft) provider in your Supabase Auth settings.";
        } else if (
          msg.includes("network") ||
          msg.includes("fetch") ||
          msg.includes("failed to fetch")
        ) {
          text =
            "Connection error. Check your internet and that Supabase is reachable, then try again.";
        } else {
          text = err.message;
        }
      }
      setMessage({ type: "error", text });
      setOauthProvider(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    if (
      !isSignUp &&
      normalizedEmail === DEMO_ACCOUNTS.seller.email &&
      password === DEMO_ACCOUNTS.seller.password
    ) {
      startDemo(() => demoSignIn("seller", nextPath));
      setLoading(false);
      return;
    }
    if (
      !isSignUp &&
      normalizedEmail === DEMO_ACCOUNTS.buyer.email &&
      password === DEMO_ACCOUNTS.buyer.password
    ) {
      startDemo(() => demoSignIn("buyer", nextPath));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim() || undefined,
              intent,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}&intent=${intent}`,
          },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setMessage({
            type: "success",
            text: isInvite
              ? "Check your email to confirm. After confirming, you’ll return to the seller inventory and it will be linked to your buyer account."
              : "Check your email for the confirmation link.",
          });
          return;
        }
        if (data.session) {
          await finishAuth(nextPath, role);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await finishAuth(nextPath, role);
      }
    } catch (err: unknown) {
      let text = "Something went wrong.";
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (
          msg.includes("network") ||
          msg.includes("fetch") ||
          msg.includes("failed to fetch") ||
          msg.includes("internal")
        ) {
          text =
            "Connection error. Check your internet and that Supabase is reachable, then try again.";
        } else {
          text = err.message;
        }
      }
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(selected: "seller" | "buyer") {
    const account = DEMO_ACCOUNTS[selected];
    setMode("signin");
    setRole(selected);
    setEmail(account.email);
    setPassword(account.password);
    setMessage({
      type: "success",
      text: `Demo credentials filled. Click “Enter as ${selected}” below, or use the one-click button.`,
    });
  }

  const inputClass =
    "w-full rounded-md border border-[var(--border)] bg-white px-4 py-2.5 text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

  const busy = loading || demoPending || oauthProvider !== null;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <p className="font-display text-3xl text-[var(--ink)]">Harbor</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{intentLabel}</p>
        {isInvite && (
          <p className="mt-3 rounded-md bg-[var(--accent-soft)] px-3 py-2 text-xs text-[var(--muted)]">
            You were invited via a private Seller Inventory link. Create a buyer
            account (or sign in) to open it—your account will keep access.
          </p>
        )}
      </div>

      <div className="mb-6 border border-[var(--border)] bg-[var(--accent-soft)] p-5">
        <p className="text-sm font-semibold text-[var(--ink)]">Test logins</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          {isInvite
            ? "Use the buyer demo account to open and link this inventory without creating a Supabase user."
            : "Use these demo accounts to open the seller or buyer admin areas without creating a Supabase user."}
        </p>
        <div className="mt-4 grid gap-2">
          {!isInvite && (
            <button
              type="button"
              disabled={busy}
              onClick={() => startDemo(() => demoSignIn("seller", nextPath))}
              className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-50"
            >
              Enter as seller admin
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => startDemo(() => demoSignIn("buyer", nextPath))}
            className={`rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
              isInvite
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]"
                : "border border-[var(--border)] bg-white text-[var(--ink)] hover:bg-white/80"
            }`}
          >
            {isInvite ? "Enter as buyer & open inventory" : "Enter as buyer admin"}
          </button>
        </div>
        <div className="mt-4 space-y-2 text-xs text-[var(--muted)]">
          {!isInvite && (
            <button
              type="button"
              className="block w-full text-left hover:text-[var(--ink)]"
              onClick={() => fillDemo("seller")}
            >
              Seller: {DEMO_ACCOUNTS.seller.email} /{" "}
              {DEMO_ACCOUNTS.seller.password}
            </button>
          )}
          <button
            type="button"
            className="block w-full text-left hover:text-[var(--ink)]"
            onClick={() => fillDemo("buyer")}
          >
            Buyer: {DEMO_ACCOUNTS.buyer.email} / {DEMO_ACCOUNTS.buyer.password}
          </button>
        </div>
      </div>

      <div className="border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="mb-6 flex gap-2 rounded-md bg-[var(--mist)] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setMessage(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-white text-[var(--ink)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-white text-[var(--ink)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Sign up
          </button>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">I am a…</p>
          {isInvite ? (
            <p className="rounded-md bg-[var(--mist)] px-3 py-2.5 text-sm font-medium text-[var(--ink)]">
              Buyer (required for shared inventory links)
            </p>
          ) : (
            <div className="flex gap-2 rounded-md bg-[var(--mist)] p-1">
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  role === "seller"
                    ? "bg-white text-[var(--ink)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Seller
              </button>
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  role === "buyer"
                    ? "bg-white text-[var(--ink)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Buyer
              </button>
            </div>
          )}
        </div>

        {callbackError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Sign-in link expired or there was a connection problem. Try signing
            in again.
          </p>
        )}

        {message && (
          <p
            className={`mb-4 rounded-md px-3 py-2 text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleOAuthSignIn("google")}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--mist)] disabled:opacity-50"
          >
            <GoogleIcon />
            {oauthProvider === "google"
              ? "Redirecting to Google…"
              : "Continue with Google"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleOAuthSignIn("azure")}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--mist)] disabled:opacity-50"
          >
            <MicrosoftIcon />
            {oauthProvider === "azure"
              ? "Redirecting to Microsoft…"
              : "Continue with Microsoft"}
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            or
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-[var(--ink)]"
              >
                Organization or display name
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="organization"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="District, company, or vendor name"
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[var(--ink)]"
            >
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@district.edu"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[var(--ink)]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={isSignUp ? "At least 6 characters" : ""}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-dark)] disabled:opacity-50"
          >
            {loading
              ? "Please wait…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link
            href="/"
            className="font-medium text-[var(--accent)] hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
