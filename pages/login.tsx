import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

export default function Login() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  // If already signed in, go to dashboard (prevents flicker loops)
  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      if (u) router.replace("/dashboard");
    });
    return off;
  }, [auth, router]);

  async function ensureUserProfile(uid: string, email?: string | null) {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: email ?? "",
        createdAt: new Date().toISOString(),
      });
    }
  }

  async function googleLogin() {
    setErr(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await ensureUserProfile(user.uid, user.email);
      router.replace("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function emailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, pw);
      await ensureUserProfile(user.uid, user.email);
      router.replace("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Email sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function emailCreateAccount() {
    setErr(null);
    setBusy(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, pw);
      await ensureUserProfile(user.uid, user.email);
      router.replace("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Account creation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-sky-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <div className="flex items-center gap-3 mb-4">
          <Image src="/logo.png" alt="Taktr" width={48} height={48} />
          <h1 className="text-xl font-semibold">Sign in to Taktr</h1>
        </div>

        <button
          onClick={googleLogin}
          disabled={busy}
          className="w-full rounded bg-black text-white py-2 mb-4 disabled:opacity-50"
        >
          Sign in with Google
        </button>

        <div className="text-center text-xs text-gray-500 my-2">or</div>

        <form onSubmit={emailLogin} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded border px-3 py-2"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded bg-sky-600 text-white py-2 disabled:opacity-50"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={emailCreateAccount}
              disabled={busy}
              className="flex-1 rounded border py-2 disabled:opacity-50"
            >
              Create account
            </button>
          </div>
        </form>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </div>
    </div>
  );
}