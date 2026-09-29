import React from 'react';
import {
  FileText,
  Sheet as SheetIcon,
  Mail,
  Zap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface SignInPromptProps {
  onSignIn: () => void;
  isLoading: boolean;
  adminEmail: string;
}

export const SignInPrompt: React.FC<SignInPromptProps> = ({
  onSignIn,
  isLoading,
  adminEmail,
}) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-3xl w-full bg-white rounded-[2.5rem] border-4 border-indigo-100 shadow-2xl overflow-hidden">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/25 border border-indigo-400/40 text-indigo-200 text-xs font-black uppercase tracking-wider mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Google Connected • Free Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
              CRM <span className="text-emerald-400">FLOW</span>
            </h1>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-xl font-medium">
              A high-speed, automated client pipeline connecting <strong>Google Forms</strong>,{' '}
              <strong>Google Sheets</strong>, and <strong>Gmail</strong> with custom Apps Script triggers.
            </p>
          </div>
        </div>

        {/* 3 Pillars Overview */}
        <div className="p-8 sm:p-10 bg-[#F8FAFF] border-b-4 border-indigo-50">
          <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Connected 4-Step Pipeline Flow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border-2 border-indigo-100 shadow-sm hover:border-indigo-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-1">
                Step 1 • Intake
              </span>
              <h3 className="font-black text-slate-900 text-base">Google Form</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Client intake form for name, email, budget, and service requirements.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-100 shadow-sm hover:border-emerald-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <SheetIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-1">
                Step 2 • The Core
              </span>
              <h3 className="font-black text-slate-900 text-base">Google Sheet</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Centralized database where every submission is logged in real-time.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-amber-100 shadow-sm hover:border-amber-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block mb-1">
                Step 3 • The Pulse
              </span>
              <h3 className="font-black text-slate-900 text-base">Apps Script</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Automatic trigger sends custom welcome email & alerts {adminEmail}.
              </p>
            </div>
          </div>
        </div>

        {/* Sign In CTA */}
        <div className="p-8 sm:p-10 text-center bg-white">
          <p className="text-xs font-semibold text-slate-500 mb-6 max-w-md mx-auto">
            Authorize with your Google account ({adminEmail}) to manage Forms, Sheets, and Gmail via Google Workspace APIs.
          </p>

          <button
            id="google-signin-btn"
            onClick={onSignIn}
            disabled={isLoading}
            className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-5 h-5 bg-white rounded-full p-0.5"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            )}
            <span className="tracking-wide">
              {isLoading ? 'CONNECTING TO GOOGLE...' : 'SIGN IN WITH GOOGLE'}
            </span>
            <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-6 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Direct Client Authentication via Google Identity Services</span>
          </div>
        </div>
      </div>
    </div>
  );
};
