"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch, getAuthData } from "@/app/utils/auth";
import { API_ENDPOINTS } from '@/app/config/api';
import { useTheme } from "@/context/ThemeContext";
import { EyeIcon, EyeCloseIcon } from "@/components/icons";

interface InviteFamilyMemberFormProps {
  onSuccess?: (email: string) => void;
  hideTitle?: boolean;
}

const PERSONS_API = API_ENDPOINTS.persons.all;

export default function InviteFamilyMemberForm({ onSuccess, hideTitle }: InviteFamilyMemberFormProps) {
  const { theme } = useTheme();
  const [persons, setPersons] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = getAuthData();

  useEffect(() => {
    authenticatedFetch(PERSONS_API)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPersons(data.data.filter((p: any) => p.email));
        }
      })
      .catch((error) => {
        console.error("Error fetching persons:", error);
      });
  }, []);

  useEffect(() => {
    if (formData.email) {
      const selected = persons.find((p) => p.email === formData.email);
      setFormData((prev) => ({ ...prev, name: selected ? selected.name : "" }));
    } else {
      setFormData((prev) => ({ ...prev, name: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    try {
      // 1. Create user
      const userRes = await fetch(API_ENDPOINTS.auth.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          familyId: currentUser?.familyId,
        }),
      });
      const userData = await userRes.json();
      if (!userRes.ok) {
        setError(userData.message || "Failed to create user");
        setIsLoading(false);
        return;
      }
      // 2. Create person profile (if not already exists)
      // await authenticatedFetch(API_ENDPOINTS.persons.create, {
      //   method: "POST",
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //   }),
      // });
      setIsLoading(false);
      if (onSuccess) onSuccess(formData.email);
      setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "viewer" });
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 mx-auto">
      {!hideTitle && (
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-foreground text-title-sm sm:text-title-md">
            Invite your family members
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a family member to invite them to the platform.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground text-foreground"
              required
            >
              <option value="">Select email</option>
              {persons.map((p) => (
                <option key={p._id} value={p.email}>
                  {p.name ? `${p.name} (${p.email})` : p.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              readOnly
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground text-foreground"
              placeholder="Name will be auto-filled"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground text-foreground"
                placeholder="Enter password"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeIcon className="fill-current" /> : <EyeCloseIcon className="fill-current" />}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground text-foreground"
                placeholder="Confirm password"
                required
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeIcon className="fill-current" /> : <EyeCloseIcon className="fill-current" />}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Role <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground text-foreground"
              required
            >
              <option value="viewer">Viewer (View only)</option>
              <option value="sub-admin">Sub-Admin (View, Edit and Add Family Members)</option>
              <option value="admin">Admin (Full Access - Manage Users & Everything)</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 