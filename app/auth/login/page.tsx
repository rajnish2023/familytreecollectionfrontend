'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '@/components/icons';
import { setAuthData } from '@/app/utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthData(data);
        router.push('/dashboard/home');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAlert = (type: 'error' | 'success', message: string) => {
    const baseStyles =
      'px-4 py-3 rounded relative border text-sm mb-4';
    const styles = {
      error: `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300`,
      success: `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300`,
    };
    return (
      <div className={styles[type]} role="alert">
        <span className="block">{message}</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md px-4">
      <div>
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-foreground text-title-sm sm:text-title-md">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {searchParams.get('registered') &&
            renderAlert('success', 'Registration successful! Please sign in.')}
          {error && renderAlert('error', error)}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground text-foreground"
              placeholder="info@gmail.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground text-foreground"
                placeholder="Enter your password"
              />
              <span
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeIcon className="fill-current" /> : <EyeCloseIcon className="fill-current" />}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Uncomment if you enable signup */}
        {/* 
        <div className="mt-5 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:text-primary/90">
              Sign up
            </Link>
          </p>
        </div>
        */}
      </div>
    </div>
  );
}
