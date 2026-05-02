"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "../lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      await signIn.email(
        { email: normalizedEmail, password },
        {
          onSuccess: () => router.push("/products"),
          onError: (ctx) => setError(ctx.error.message ?? "Login gagal.")
        }
      );
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-soft">
      <p className="label">Admin Login</p>
      <h1 className="mt-3 text-3xl font-semibold text-clay">Masuk ke portal produk</h1>
      <p className="mt-3 text-sm leading-6 text-clay/70">Gunakan akun admin Better Auth yang dibuat lewat seed backend.</p>

      <label className="mt-6 block">
        <span className="label">Email</span>
        <input className="field mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label className="mt-4 block">
        <span className="label">Password</span>
        <input className="field mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

      <button type="submit" disabled={loading} className="button-primary mt-6 w-full">
        {loading ? "Memproses..." : "Login"}
      </button>
    </form>
  );
}
