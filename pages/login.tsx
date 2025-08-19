// pages/login.tsx
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import app from "@/lib/firebase"; // default export = Firebase app
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already signed in (runs only in the browser)
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/dashboard");
    });
    return () => unsub();
  }, [router]);

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged will navigate
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const auth = getAuth(app);
      await signInWithPopup(auth, new GoogleAuthProvider());
      // onAuthStateChanged will navigate
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign in to Taktr</title>
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-blue-700">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <div className="mb-4 text-center">
            <img src="/logo.png" alt="Taktr" className="mx-auto h-12 w-12" />
            <h1 className="mt-2 text-xl font-semibold">Sign in to Taktr</h1>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="mb-4 w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            Sign in with Google
          </button>

          <div className="my-3 text-center text-sm text-gray-500">or</div>

          <form onSubmit={handleEmailPassword} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border px-3 py-2"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border px-3 py-2"
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Log in"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}