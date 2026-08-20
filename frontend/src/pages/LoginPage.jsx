import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Shield, AlertCircle, ArrowRight, Truck } from "lucide-react";

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@fleet360.in");
  const [password, setPassword] = useState("Fleet360Admin!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-[#0284C7]/30 selection:text-[#06B6D4]">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0284C7]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#7C3AED] text-white shadow-xl shadow-[#0284C7]/20 mb-4 border border-white/20">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold font-condensed tracking-wider text-white uppercase">
            FLEET<span className="text-[#06B6D4]">360</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            AI-Powered Fleet Profitability & Management Intelligence
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-bold font-condensed uppercase tracking-wider text-white mb-2">
            Sign In to Command Center
          </h2>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Enter your credentials to access vehicle P&L, route analytics, and scorecards.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fleet360.in"
                  className="w-full bg-[#0F1419] border border-[#2D3748] focus:border-[#06B6D4] text-xs font-mono text-white rounded-lg pl-9 pr-3 py-2.5 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0F1419] border border-[#2D3748] focus:border-[#06B6D4] text-xs font-mono text-white rounded-lg pl-9 pr-3 py-2.5 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] hover:from-[#0369A1] hover:to-[#0891B2] text-white font-condensed font-bold uppercase tracking-wider text-sm py-3 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Command Center
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="mt-8 pt-6 border-t border-[#2D3748]">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#06B6D4]" />
              Quick Demo Logins:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials("admin@fleet360.in", "Fleet360Admin!")}
                className="p-2 rounded-lg bg-[#0F1419] hover:bg-[#252D3D] border border-[#2D3748] text-left transition-colors cursor-pointer group"
              >
                <div className="text-[10px] font-bold text-sky-400 font-mono">ADMIN</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">admin@fleet360.in</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("manager@fleet360.in", "Fleet360Manager!")}
                className="p-2 rounded-lg bg-[#0F1419] hover:bg-[#252D3D] border border-[#2D3748] text-left transition-colors cursor-pointer group"
              >
                <div className="text-[10px] font-bold text-emerald-400 font-mono">MANAGER</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">manager@fleet360.in</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("analyst@fleet360.in", "Fleet360Analyst!")}
                className="p-2 rounded-lg bg-[#0F1419] hover:bg-[#252D3D] border border-[#2D3748] text-left transition-colors cursor-pointer group"
              >
                <div className="text-[10px] font-bold text-purple-400 font-mono">ANALYST</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">analyst@fleet360.in</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          Fleet360 Transport Intelligence Platform &bull; FastAPI + React
        </div>
      </div>
    </div>
  );
};
