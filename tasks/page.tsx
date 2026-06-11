"use client";

import { useState } from "react";
import { Shield, Eye, EyeOff, Lock, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useAegisStore } from "@/hooks/useStore";
import { demoUsers } from "@/lib/demo-data";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAegisStore((s) => s.setUser);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const user = demoUsers.find((u) => u.email === email);
      if (user && password.length > 0) {
        setUser(user);
        // Route based on role
        const redirectPath =
          user.role === "guardian"
            ? "/guardian/"
            : ["watch_officer", "commander", "analyst"].includes(user.role)
            ? "/command/"
            : "/";
        window.location.href = redirectPath;
      } else {
        setError("Invalid credentials. Try: ibrahim@example.com or musa@police.ng (any password)");
        setIsLoading(false);
      }
    }, 1000);
  };

  const quickLogins = [
    { label: "Guardian", email: "ibrahim@example.com", role: "guardian" },
    { label: "Commander", email: "musa@police.ng", role: "commander" },
    { label: "Analyst", email: "sarah@aegis.ng", role: "analyst" },
    { label: "Admin", email: "admin@aegis.ng", role: "admin" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600/20 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Aegis CSG</h1>
          <p className="text-slate-400 mt-1">Civilian Safety Grid</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 rounded-lg font-medium text-white transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">
              Quick Login (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((login) => (
                <button
                  key={login.email}
                  onClick={() => {
                    setEmail(login.email);
                    setPassword("password");
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors text-left"
                >
                  <div className="font-medium">{login.label}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {login.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          >
            &larr; Back to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
