import React from 'react';
import {
  FileText,
  Sheet as SheetIcon,
  Mail,
  Code2,
  CheckCircle2,
  LogOut,
  Sparkles,
  ExternalLink,
  Users,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  activeTab: 'form' | 'sheet' | 'script' | 'test' | 'crm';
  onSelectTab: (tab: 'form' | 'sheet' | 'script' | 'test' | 'crm') => void;
  formConfigured: boolean;
  sheetConfigured: boolean;
  onLogout: () => void;
  adminEmail: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onSelectTab,
  formConfigured,
  sheetConfigured,
  onLogout,
  adminEmail,
}) => {
  const steps = [
    {
      id: 'form',
      label: '1. Form',
      sublabel: 'Client Intake',
      icon: FileText,
      ready: formConfigured,
    },
    {
      id: 'sheet',
      label: '2. Sheet',
      sublabel: 'CRM Database',
      icon: SheetIcon,
      ready: sheetConfigured,
    },
    {
      id: 'script',
      label: '3. Script',
      sublabel: 'Auto Email',
      icon: Code2,
      ready: formConfigured && sheetConfigured,
    },
    {
      id: 'test',
      label: '4. Test',
      sublabel: 'Verify Flow',
      icon: CheckCircle2,
      ready: true,
    },
    {
      id: 'crm',
      label: 'CRM Leads',
      sublabel: 'Live Pipeline',
      icon: Users,
      ready: sheetConfigured,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b-4 border-indigo-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-indigo-600">
                  CRM <span className="text-emerald-500">FLOW</span>
                </h1>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 text-[11px] font-black bg-emerald-50 text-emerald-600 border-2 border-emerald-200 rounded-full uppercase tracking-wider">
                  Google Connected
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                Forms • Sheets • Apps Script • Gmail
              </p>
            </div>
          </div>

          {/* User Profile / Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center px-3.5 py-1.5 bg-indigo-50 rounded-full border-2 border-indigo-200">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                Active Instance
              </span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3 bg-slate-50 border-2 border-slate-200 rounded-2xl py-1.5 px-3.5 shadow-sm">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-xl border border-slate-300 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-sm">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                    {adminEmail}
                  </div>
                </div>
                <button
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  title="Sign out of Google"
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="px-4 py-2 bg-amber-500 text-white font-black text-xs uppercase rounded-xl shadow-md tracking-wider">
                Auth Pending
              </div>
            )}
          </div>
        </div>

        {/* Step Navigation Bar */}
        <div className="flex space-x-1.5 sm:space-x-3 border-t-2 border-slate-100 py-2.5 overflow-x-auto scrollbar-none">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeTab === step.id;
            return (
              <button
                key={step.id}
                id={`tab-${step.id}-btn`}
                onClick={() => onSelectTab(step.id as any)}
                className={`flex items-center space-x-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-y-[-1px]'
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <div className="text-left">
                  <div className="leading-tight text-xs font-black uppercase tracking-wider">
                    {step.label}
                  </div>
                  <div
                    className={`text-[10px] font-semibold leading-none ${
                      isActive ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {step.sublabel}
                  </div>
                </div>
                {step.ready && (
                  <span className={`w-2 h-2 rounded-full ml-1 ${isActive ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
