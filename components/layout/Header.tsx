"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "../../context/SidebarContext";
import { getAuthData, clearAuthData, setAuthData, authenticatedFetch } from "@/app/utils/auth";
import { API_ENDPOINTS } from '@/app/config/api';
import ThemeToggle from "./ThemeToggle";

function ChangeEmailModal({ isOpen, onClose, currentEmail, onEmailChanged }: { isOpen: boolean; onClose: () => void; currentEmail: string; onEmailChanged: (email: string) => void; }) {
  const [email, setEmail] = useState(currentEmail || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentEmail || "");
    }
  }, [isOpen, currentEmail]);

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Update email in user and person (single endpoint)
      const res = await authenticatedFetch(API_ENDPOINTS.auth.changeEmail, {
        method: "PUT",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update email");
      setSuccess("Email updated successfully");
      onEmailChanged(email);
      const authData = getAuthData();
      if (authData) {
        setAuthData({ ...authData, email });
      }
      setTimeout(onClose, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error updating email");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card-bg, #fff)',
        borderRadius: 12,
        padding: 32,
        minWidth: 400,
        maxWidth: 600,
        width: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: 'var(--card-shadow, 0 2px 16px rgba(0,0,0,0.15))',
        border: '1px solid var(--border-color, #e5e7eb)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            color: 'var(--text-muted, #888)',
            cursor: 'pointer',
            zIndex: 10,
          }}
          aria-label="Close">
          ×
        </button>
        <h2 style={{ fontWeight: 600, fontSize: 24, marginBottom: 16, color: 'var(--text-primary, #222)', textAlign: 'center' }}>Change Email</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-primary, #222)' }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color, #e5e7eb)', color: 'var(--text-primary, #222)', width: '100%', background: 'var(--input-bg, #fff)' }} required />
          {error && <div style={{ color: 'var(--error-color, #dc2626)', fontSize: 14 }}>{error}</div>}
          {success && <div style={{ color: 'var(--success-color, #16a34a)', fontSize: 14 }}>{success}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid var(--border-color, #e5e7eb)', background: 'var(--secondary-bg, #f3f4f6)', color: 'var(--text-primary, #222)', fontWeight: 500 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid var(--primary-color, #2563eb)', background: 'var(--primary-color, #2563eb)', color: 'var(--primary-text, #fff)', fontWeight: 500 }}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  const [previousPassword, setPreviousPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.auth.changePassword, {
        method: "PUT",
        body: JSON.stringify({ previousPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");
      setSuccess("Password updated successfully");
      setTimeout(onClose, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error updating password");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card-bg, #fff)',
        borderRadius: 12,
        padding: 32,
        minWidth: 400,
        maxWidth: 600,
        width: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: 'var(--card-shadow, 0 2px 16px rgba(0,0,0,0.15))',
        border: '1px solid var(--border-color, #e5e7eb)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            color: 'var(--text-muted, #888)',
            cursor: 'pointer',
            zIndex: 10,
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h2 style={{ fontWeight: 600, fontSize: 24, marginBottom: 16, color: 'var(--text-primary, #222)', textAlign: 'center' }}>Change Password</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-primary, #222)' }}>
          <input type="password" value={previousPassword} onChange={e => setPreviousPassword(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color, #e5e7eb)', color: 'var(--text-primary, #222)', width: '100%', background: 'var(--input-bg, #fff)' }} required placeholder="Previous password" />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color, #e5e7eb)', color: 'var(--text-primary, #222)', width: '100%', background: 'var(--input-bg, #fff)' }} required placeholder="New password" />
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color, #e5e7eb)', color: 'var(--text-primary, #222)', width: '100%', background: 'var(--input-bg, #fff)' }} required placeholder="Confirm new password" />
          {error && <div style={{ color: 'var(--error-color, #dc2626)', fontSize: 14 }}>{error}</div>}
          {success && <div style={{ color: 'var(--success-color, #16a34a)', fontSize: 14 }}>{success}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid var(--border-color, #e5e7eb)', background: 'var(--secondary-bg, #f3f4f6)', color: 'var(--text-primary, #222)', fontWeight: 500 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid var(--primary-color, #2563eb)', background: 'var(--primary-color, #2563eb)', color: 'var(--primary-text, #fff)', fontWeight: 500 }}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const AppHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const { setIsMobileOpen } = useSidebar();
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const authData = getAuthData();
    if (authData) {
      setUserData(authData);
    }
  }, []);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleSignOut = () => {
    clearAuthData();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 hover:bg-accent rounded-lg"
        >
          <svg
            className="w-6 h-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={toggleProfile}
            className="flex items-center gap-2 rounded-full p-1 hover:bg-accent"
          >
            <Image
              src="/images/user/default-avatar.svg"
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-medium text-foreground">{userData?.name || 'User'}</span>
            <svg
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-popover py-1 shadow-lg ring-1 ring-border">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-popover-foreground">{userData?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{userData?.email || 'user@example.com'}</p>
                <p className="text-xs text-muted-foreground capitalize">Role: {userData?.role || 'N/A'}</p>
              </div>
              <button
                onClick={() => setShowChangeEmail(true)}
                className="block w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent"
              >
                Change Email
              </button>
              <button
                onClick={() => setShowChangePassword(true)}
                className="block w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent"
              >
                Change Password
              </button>
              <button
                onClick={handleSignOut}
                className="block w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-accent"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      <ChangeEmailModal isOpen={showChangeEmail} onClose={() => setShowChangeEmail(false)} currentEmail={userData?.email} onEmailChanged={email => setUserData({ ...userData, email })} />
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </header>
  );
};

export default AppHeader; 