"use client";

import { signInWithOAuth } from "@/auth/action";

export default function SignIn() {
  return (
    <div className="flex justify-content-center gap-4">
      <button
        className="bg-red-300"
        onClick={async () => await signInWithOAuth("google")}
      >
        google
      </button>
      <button
        className="border-3 bg-sky-300"
        onClick={async () => await signInWithOAuth("discord")}
      >
        discord
      </button>
    </div>
  );
}
