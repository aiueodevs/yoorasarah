"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createGuestSession, getCustomerMe, type CustomerSession } from "../../../lib/api";
import { changeEmail, changePassword, sendVerificationEmail, signOut } from "../../../lib/auth-client";
import { SiteLink } from "../../shared/site-link";
import { useStore } from "../../store/store-provider";

function profileCallbackURL() {
  return "/profile";
}

export function ProfilePage() {
  const router = useRouter();
  const { cartCount, refreshCart, refreshWishlist, showNotice, wishlistItems } = useStore();
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const products = wishlistItems.map((item) => item.product);
  const user = customerSession?.user;

  const authErrorMessage = (message?: string) => {
    if (!message) return "Permintaan akun gagal diproses.";
    if (message.toLowerCase().includes("too many") || message.toLowerCase().includes("terlalu sering")) {
      return "Terlalu sering mengirim email verifikasi. Coba lagi beberapa menit lagi.";
    }
    return message;
  };

  const refreshCustomerSession = async () => {
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      setCustomerSession(await getCustomerMe());
    } catch (error) {
      setCustomerSession(null);
      setCustomerError(error instanceof Error ? error.message : "Gagal memuat profil akun.");
    } finally {
      setCustomerLoading(false);
    }
  };

  useEffect(() => {
    void refreshCustomerSession();
  }, []);

  const logout = async () => {
    setLogoutLoading(true);
    await signOut();
    await createGuestSession();
    await Promise.all([refreshCart(), refreshWishlist()]);
    showNotice("Berhasil keluar akun.");
    setLogoutLoading(false);
    router.push("/");
    router.refresh();
  };

  const resendVerification = async () => {
    if (!user?.email) return;

    setEmailError(null);
    setEmailMessage(null);
    setResendLoading(true);
    try {
      await sendVerificationEmail(
        { email: user.email, callbackURL: profileCallbackURL() },
        {
          onSuccess: () => {
            setEmailMessage("Link verifikasi sudah dikirim ulang ke email Anda.");
            showNotice("Link verifikasi dikirim ulang.");
            setResendLoading(false);
          },
          onError: (ctx: { error: { message?: string } }) => {
            setEmailError(authErrorMessage(ctx.error.message));
            setResendLoading(false);
          }
        }
      );
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "Gagal mengirim email verifikasi.");
      setResendLoading(false);
    }
  };

  const submitEmailChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.email) return;

    const normalizedEmail = newEmail.trim().toLowerCase();
    setEmailError(null);
    setEmailMessage(null);

    if (!normalizedEmail) {
      setEmailError("Email baru wajib diisi.");
      return;
    }

    if (normalizedEmail === user.email.toLowerCase()) {
      setEmailError("Email baru masih sama dengan email saat ini.");
      return;
    }

    setEmailLoading(true);
    try {
      await changeEmail(
        { newEmail: normalizedEmail, callbackURL: profileCallbackURL() },
        {
          onSuccess: () => {
            setNewEmail("");
            setEmailMessage("Link verifikasi sudah dikirim ke email baru. Email akun akan berubah setelah link dibuka.");
            showNotice("Cek email baru untuk konfirmasi perubahan.");
            setEmailLoading(false);
          },
          onError: (ctx: { error: { message?: string } }) => {
            setEmailError(authErrorMessage(ctx.error.message));
            setEmailLoading(false);
          }
        }
      );
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "Gagal memproses perubahan email.");
      setEmailLoading(false);
    }
  };

  const submitPasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password belum sama.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(
        { currentPassword, newPassword, revokeOtherSessions },
        {
          onSuccess: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMessage("Password berhasil diperbarui.");
            showNotice("Password akun diperbarui.");
            setPasswordLoading(false);
          },
          onError: (ctx: { error: { message?: string } }) => {
            setPasswordError(authErrorMessage(ctx.error.message));
            setPasswordLoading(false);
          }
        }
      );
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Gagal memperbarui password.");
      setPasswordLoading(false);
    }
  };

  if (customerLoading) {
    return <section className="rounded-[28px] border border-[#eaded5] bg-white p-8 text-ink-soft shadow-soft">Memuat profil...</section>;
  }

  if (customerError) {
    return <section className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm font-semibold text-red-700 shadow-soft">{customerError}</section>;
  }

  if (!user) {
    return (
      <section className="grid gap-6 rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/80 p-6 shadow-soft backdrop-blur lg:grid-cols-[1fr_360px]">
        <div>
          <p className="micro-label">Profil Akun</p>
          <h1 className="display-title mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">Masuk untuk menyimpan aktivitas belanja Anda.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">Cart dan wishlist yang sudah dibuat sebagai tamu akan tersambung ke akun setelah login.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <SiteLink href="/login" className="rounded-full bg-[#2b1c18] px-5 py-3 text-sm font-bold text-white">Masuk Akun</SiteLink>
            <SiteLink href="/register" className="rounded-full border border-[#d7bdaf] bg-white px-5 py-3 text-sm font-bold text-ink">Buat Akun</SiteLink>
          </div>
        </div>
        <aside className="rounded-[24px] border border-[#eaded5] bg-white/72 p-5">
          <p className="micro-label">Sesi Tamu</p>
          <h2 className="mt-3 font-display text-4xl font-medium">{cartCount} Item</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">Keranjang dan wishlist tetap bisa dipakai tanpa login, lalu bisa disimpan ke akun kapan saja.</p>
        </aside>
      </section>
    );
  }

  return (
    <>
      <section className="grid gap-6 rounded-[28px] border border-[#eaded5] bg-[#fffaf5]/80 p-6 shadow-soft backdrop-blur lg:grid-cols-[1fr_360px]">
        <div>
          <p className="micro-label">Profil Akun</p>
          <h1 className="display-title mt-3 max-w-3xl text-4xl leading-tight sm:text-6xl">Halo, {user.name}.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">{user.email}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <SiteLink href="/wishlist" className="rounded-full bg-[#2b1c18] px-5 py-3 text-sm font-bold text-white">Buka wishlist</SiteLink>
            <SiteLink href="/cart" className="rounded-full border border-[#d7bdaf] bg-white px-5 py-3 text-sm font-bold text-ink">Buka keranjang</SiteLink>
            <button type="button" onClick={() => void logout()} disabled={logoutLoading} className="rounded-full border border-[#d7bdaf] bg-white px-5 py-3 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60">
              {logoutLoading ? "Keluar..." : "Logout"}
            </button>
          </div>
        </div>
        <aside className="grid gap-3">
          {[
            ["Status Akun", "Aktif", "Akun customer tersambung dengan Better Auth."],
            ["Item Keranjang", String(cartCount).padStart(2, "0"), "Semua item tersimpan di backend."],
            ["Wishlist", String(wishlistItems.length).padStart(2, "0"), "Produk favorit tersinkron dengan akun saat login."]
          ].map(([label, title, body]) => (
            <div key={label} className="rounded-[18px] border border-[#eaded5] bg-white/76 p-4">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">{label}</span>
              <h2 className="mt-2 font-display text-3xl font-medium">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </aside>
      </section>

      {!user.emailVerified && (
        <section className="mt-8 rounded-[24px] border border-[#eaded5] bg-[#fff7ef] p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="micro-label">Verifikasi Email</p>
              <h2 className="mt-2 font-display text-3xl font-medium text-ink">Email akun belum diverifikasi.</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Verifikasi email agar akun bisa dipakai penuh dan perubahan akun tetap aman.</p>
            </div>
            <button type="button" onClick={() => void resendVerification()} disabled={resendLoading} className="h-11 rounded-full bg-[#2b1c18] px-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60">
              {resendLoading ? "Mengirim..." : "Kirim Verifikasi"}
            </button>
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <form onSubmit={submitEmailChange} className="rounded-[24px] border border-[#eaded5] bg-white/78 p-5 shadow-soft">
          <p className="micro-label">Settings Akun</p>
          <h2 className="mt-3 font-display text-3xl font-medium text-ink">Update email</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">Link verifikasi akan dikirim ke email baru. Email berubah setelah link tersebut dibuka.</p>

          <label className="mt-5 block">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Email saat ini</span>
            <input className="mt-2 h-12 w-full border border-[#eaded5] bg-[#fffaf5] px-4 text-sm text-ink-soft outline-none" value={user.email} disabled />
          </label>

          <label className="mt-5 block">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Email baru</span>
            <input className="mt-2 h-12 w-full border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#b98572]" type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} required />
          </label>

          {emailMessage && <p className="mt-4 rounded-[16px] border border-[#d7bdaf] bg-[#fffaf5] px-4 py-3 text-sm font-semibold text-ink-soft">{emailMessage}</p>}
          {emailError && <p className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{emailError}</p>}

          <button type="submit" disabled={emailLoading} className="mt-5 h-12 w-full bg-[#2b1c18] px-5 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white transition hover:bg-[#3a2822] disabled:cursor-not-allowed disabled:opacity-60">
            {emailLoading ? "Mengirim..." : "Kirim Verifikasi Email Baru"}
          </button>
        </form>

        <form onSubmit={submitPasswordChange} className="rounded-[24px] border border-[#eaded5] bg-white/78 p-5 shadow-soft">
          <p className="micro-label">Keamanan</p>
          <h2 className="mt-3 font-display text-3xl font-medium text-ink">Update password</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">Masukkan password saat ini sebelum mengganti ke password baru.</p>

          <label className="mt-5 block">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Password saat ini</span>
            <input className="mt-2 h-12 w-full border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#b98572]" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
          </label>

          <label className="mt-5 block">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Password baru</span>
            <input className="mt-2 h-12 w-full border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#b98572]" type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
          </label>

          <label className="mt-5 block">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">Konfirmasi password baru</span>
            <input className="mt-2 h-12 w-full border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#b98572]" type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </label>

          <label className="mt-5 flex items-start gap-3 rounded-[18px] border border-[#eaded5] bg-[#fffaf5] p-4 text-sm font-semibold text-ink-soft">
            <input className="mt-1 accent-[#51403A]" type="checkbox" checked={revokeOtherSessions} onChange={(event) => setRevokeOtherSessions(event.target.checked)} />
            Logout perangkat lain setelah password berubah.
          </label>

          {passwordMessage && <p className="mt-4 rounded-[16px] border border-[#d7bdaf] bg-[#fffaf5] px-4 py-3 text-sm font-semibold text-ink-soft">{passwordMessage}</p>}
          {passwordError && <p className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{passwordError}</p>}

          <button type="submit" disabled={passwordLoading} className="mt-5 h-12 w-full bg-[#2b1c18] px-5 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white transition hover:bg-[#3a2822] disabled:cursor-not-allowed disabled:opacity-60">
            {passwordLoading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#eaded5] bg-white/78 p-5 shadow-soft">
          <p className="micro-label">Akses Cepat</p>
          <div className="mt-4 grid gap-3">
            <SiteLink href="/wishlist" className="rounded-[18px] border border-[#eaded5] p-4">
              <h2 className="font-display text-2xl">Wishlist</h2>
              <p className="text-sm text-ink-soft">Bandingkan produk sebelum lanjut belanja.</p>
            </SiteLink>
            <SiteLink href="/checkout" className="rounded-[18px] border border-[#eaded5] p-4">
              <h2 className="font-display text-2xl">Lanjut checkout</h2>
              <p className="text-sm text-ink-soft">Lihat ringkasan belanja dan teruskan ke pengiriman serta pembayaran.</p>
            </SiteLink>
          </div>
        </div>
        <div className="rounded-[24px] border border-[#eaded5] bg-white/78 p-5 shadow-soft">
          <h2 className="display-title text-3xl">Produk yang terakhir Anda simpan.</h2>
          <div className="mt-4 grid gap-3">
            {products.length === 0 && <p className="rounded-[18px] border border-[#eaded5] p-4 text-sm text-ink-soft">Belum ada wishlist yang tersimpan.</p>}
            {products.slice(0, 2).map((product) => (
              <SiteLink key={product.slug} href={product.slug} className="flex items-center justify-between gap-4 rounded-[18px] border border-[#eaded5] p-4">
                <span>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#9b725f]">{product.category}</span>
                  <h3 className="font-display text-2xl">{product.name}</h3>
                  <small className="text-ink-soft">Buka detail produk untuk cek stok, ukuran, dan warna terbaru.</small>
                </span>
                <strong>{product.price}</strong>
              </SiteLink>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
