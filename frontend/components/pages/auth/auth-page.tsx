"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { attachCustomerSession } from "../../../lib/api";
import { sendVerificationEmail, signIn, signUp } from "../../../lib/auth-client";
import { SiteLink } from "../../shared/site-link";
import { useStore } from "../../store/store-provider";

type AuthMode = "login" | "register";

function profileCallbackURL() {
  return "/profile";
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { refreshCart, refreshWishlist, showNotice } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const isRegister = mode === "register";

  const authErrorMessage = (message?: string, genericLogin = false) => {
    if (!message) return "Autentikasi gagal.";
    if (message.toLowerCase().includes("too many") || message.toLowerCase().includes("terlalu sering")) {
      return "Terlalu sering mengirim email verifikasi. Coba lagi beberapa menit lagi.";
    }
    if (genericLogin || message.toLowerCase().includes("email not verified") || message.toLowerCase().includes("email belum")) {
      return "Email atau password salah, atau email belum diverifikasi.";
    }
    return message;
  };

  const finishAuth = async () => {
    await attachCustomerSession();
    await Promise.all([refreshCart(), refreshWishlist()]);
    showNotice(isRegister ? "Akun berhasil dibuat." : "Berhasil masuk akun.");
    router.push("/profile");
    router.refresh();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    const handleSuccess = async () => {
      try {
        await finishAuth();
      } catch (authError) {
        setError(authError instanceof Error ? authError.message : "Akun berhasil masuk, tetapi sesi belanja belum tersambung.");
      } finally {
        setLoading(false);
      }
    };

    const callbacks = {
      onSuccess: () => {
        if (isRegister) {
          setVerificationEmail(normalizedEmail);
          setPassword("");
          showNotice("Link verifikasi sudah dikirim ke email Anda.");
          setLoading(false);
          return;
        }

        void handleSuccess();
      },
      onError: (ctx: { error: { message?: string } }) => {
        setError(authErrorMessage(ctx.error.message, !isRegister));
        setLoading(false);
      }
    };

    try {
      if (isRegister) {
        await signUp.email({ email: normalizedEmail, password, name: name.trim() || normalizedEmail.split("@")[0], callbackURL: profileCallbackURL() }, callbacks);
      } else {
        await signIn.email({ email: normalizedEmail, password, callbackURL: profileCallbackURL() }, callbacks);
      }
    } catch (authError) {
      setError(authErrorMessage(authError instanceof Error ? authError.message : undefined, !isRegister));
      setLoading(false);
    }

  };

  const resendVerification = async () => {
    const targetEmail = verificationEmail ?? email.trim().toLowerCase();
    if (!targetEmail) return;

    setError(null);
    setResendLoading(true);
    try {
      await sendVerificationEmail(
        { email: targetEmail, callbackURL: profileCallbackURL() },
        {
          onSuccess: () => {
            showNotice("Link verifikasi dikirim ulang.");
            setResendLoading(false);
          },
          onError: (ctx: { error: { message?: string } }) => {
            setError(authErrorMessage(ctx.error.message));
            setResendLoading(false);
          }
        }
      );
    } catch (authError) {
      setError(authErrorMessage(authError instanceof Error ? authError.message : undefined));
      setResendLoading(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-[1080px] gap-6 rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/86 p-6 shadow-soft backdrop-blur lg:grid-cols-[1fr_420px]">
      <div className="flex flex-col justify-between rounded-[24px] border border-[#eaded5] bg-white/72 p-6">
        <div>
          <p className="micro-label">Akun Yoora Sarah</p>
          <h1 className="display-title mt-3 max-w-2xl text-4xl leading-tight sm:text-6xl">
            {isRegister ? "Buat akun untuk menyimpan pilihan belanja Anda." : "Masuk untuk melanjutkan pilihan yang sudah tersimpan."}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-ink-soft">
            Cart dan wishlist dari sesi tamu akan otomatis tersambung ke akun setelah berhasil masuk.
          </p>
        </div>
        <div className="mt-8 grid gap-3 text-sm text-ink-soft sm:grid-cols-3">
          {["Wishlist tersimpan", "Cart tersinkron", "Profil belanja"].map((item) => (
            <span key={item} className="rounded-[18px] border border-[#eaded5] bg-[#fffaf5] p-4 font-semibold text-ink-soft">{item}</span>
          ))}
        </div>
      </div>

      {isRegister && verificationEmail ? (
        <div className="rounded-[24px] border border-[#eaded5] bg-white p-6 shadow-soft">
          <p className="micro-label">Verifikasi Email</p>
          <h2 className="mt-3 font-display text-4xl font-medium text-ink">Cek inbox Anda.</h2>
          <p className="mt-4 text-sm leading-6 text-ink-soft">
            Kami sudah mengirim link verifikasi ke <strong className="text-ink">{verificationEmail}</strong>. Akun baru bisa login setelah email diverifikasi.
          </p>

          {error && <p className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

          <button type="button" onClick={() => void resendVerification()} disabled={resendLoading} className="mt-6 h-12 w-full bg-[#2b1c18] px-5 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white transition hover:bg-[#3a2822] disabled:cursor-not-allowed disabled:opacity-60">
            {resendLoading ? "Mengirim..." : "Kirim Ulang Verifikasi"}
          </button>

          <p className="mt-5 text-center text-sm text-ink-soft">
            Sudah diverifikasi?{" "}
            <SiteLink href="/login" className="font-bold text-ink">
              Masuk Akun
            </SiteLink>
          </p>
        </div>
      ) : (
      <form onSubmit={submit} className="rounded-[24px] border border-[#eaded5] bg-white p-6 shadow-soft">
        <p className="micro-label">{isRegister ? "Daftar" : "Login"}</p>
        <h2 className="mt-3 font-display text-4xl font-medium text-ink">{isRegister ? "Buat Akun" : "Masuk Akun"}</h2>

        {isRegister && (
          <label className="mt-6 block">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Nama</span>
            <input className="mt-2 h-12 w-full border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#b98572]" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
        )}

        <label className="mt-5 block">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Email</span>
          <input className="mt-2 h-12 w-full border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#b98572]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        <label className="mt-5 block">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Password</span>
          <input className="mt-2 h-12 w-full border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#b98572]" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>

        {error && <p className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

        <button type="submit" disabled={loading} className="mt-6 h-12 w-full bg-[#2b1c18] px-5 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white transition hover:bg-[#3a2822] disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Memproses" : isRegister ? "Buat Akun" : "Masuk"}
        </button>

        <p className="mt-5 text-center text-sm text-ink-soft">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <SiteLink href={isRegister ? "/login" : "/register"} className="font-bold text-ink">
            {isRegister ? "Masuk" : "Daftar"}
          </SiteLink>
        </p>
      </form>
      )}
    </section>
  );
}
