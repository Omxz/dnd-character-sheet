"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { cn } from "@/lib/utils";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithGoogle, signInWithDiscord } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage("Check your email for the confirmation link!");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }

    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "discord") => {
    setError(null);
    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else {
        await signInWithDiscord();
      }
    } catch (err) {
      setError("Failed to sign in with " + provider);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 bg-amber-600 text-white rounded-lg font-medium",
              "hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors flex items-center justify-center gap-2"
            )}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-amber-600 hover:underline font-medium">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-amber-600 hover:underline font-medium">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
