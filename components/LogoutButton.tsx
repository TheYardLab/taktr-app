// components/LogoutButton.tsx
import React from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded bg-white/10 px-3 py-1 text-white hover:bg-white/20"
      title="Sign out"
    >
      Logout
    </button>
  );
}