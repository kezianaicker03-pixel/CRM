import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { SignInPrompt } from './components/SignInPrompt';
import { FormStep } from './components/FormStep';
import { SheetStep } from './components/SheetStep';
import { ScriptStep } from './components/ScriptStep';
import { TestStep } from './components/TestStep';
import { CrmDashboard } from './components/CrmDashboard';
import { AddClientModal } from './components/AddClientModal';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/auth';
import { GoogleFormDetails, GoogleSheetDetails, ClientLead } from './types';
import { getFormDetails } from './services/googleForms';
import {
  getSpreadsheetDetails,
  getClientLeadsFromSheet,
} from './services/googleSheets';

export default function App() {
  const adminEmail = 'kezianaicker24@gmail.com';

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const [activeTab, setActiveTab] = useState<'form' | 'sheet' | 'script' | 'test' | 'crm'>('form');

  // Form & Sheet State
  const [formDetails, setFormDetails] = useState<GoogleFormDetails | null>(() => {
    try {
      const saved = localStorage.getItem('gws_crm_form');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sheetDetails, setSheetDetails] = useState<GoogleSheetDetails | null>(() => {
    try {
      const saved = localStorage.getItem('gws_crm_sheet');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [formTitle, setFormTitle] = useState('Client Intake Form - CRM');
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser: User, token: string) => {
        setUser(currentUser);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Save form and sheet config to localStorage for continuity
  useEffect(() => {
    if (formDetails) {
      localStorage.setItem('gws_crm_form', JSON.stringify(formDetails));
    }
  }, [formDetails]);

  useEffect(() => {
    if (sheetDetails) {
      localStorage.setItem('gws_crm_sheet', JSON.stringify(sheetDetails));
    }
  }, [sheetDetails]);

  // Fetch client leads from Google Sheet
  const refreshLeads = useCallback(async () => {
    if (!accessToken || !sheetDetails) return;
    try {
      const sheetLeads = await getClientLeadsFromSheet(
        accessToken,
        sheetDetails.spreadsheetId,
        sheetDetails.sheetName || 'Clients'
      );
      setLeads(sheetLeads);
    } catch (err) {
      console.error('Failed to load leads from Sheet:', err);
    }
  }, [accessToken, sheetDetails]);

  // Trigger lead reload on sheet or token update
  useEffect(() => {
    if (accessToken && sheetDetails) {
      refreshLeads();
    }
  }, [accessToken, sheetDetails, refreshLeads]);

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Google Sign In Failed:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF] text-[#1E293B] flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        formConfigured={!!formDetails}
        sheetConfigured={!!sheetDetails}
        onLogout={handleLogout}
        adminEmail={adminEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {needsAuth || !accessToken ? (
          <SignInPrompt
            onSignIn={handleSignIn}
            isLoading={isLoadingAuth}
            adminEmail={adminEmail}
          />
        ) : (
          <div className="animate-in fade-in duration-200">
            {/* Step 1: Form */}
            {activeTab === 'form' && (
              <FormStep
                accessToken={accessToken}
                formDetails={formDetails}
                onFormCreated={(form) => {
                  setFormDetails(form);
                  setActiveTab('sheet');
                }}
                onNextStep={() => setActiveTab('sheet')}
                formTitle={formTitle}
                setFormTitle={setFormTitle}
              />
            )}

            {/* Step 2: Sheet */}
            {activeTab === 'sheet' && (
              <SheetStep
                accessToken={accessToken}
                sheetDetails={sheetDetails}
                leads={leads}
                onSheetCreated={(sheet) => {
                  setSheetDetails(sheet);
                  setActiveTab('script');
                }}
                onRefreshLeads={refreshLeads}
                onNextStep={() => setActiveTab('script')}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}

            {/* Step 3: Script */}
            {activeTab === 'script' && (
              <ScriptStep
                accessToken={accessToken}
                sheetDetails={sheetDetails}
                adminEmail={adminEmail}
                onNextStep={() => setActiveTab('test')}
              />
            )}

            {/* Step 4: Test */}
            {activeTab === 'test' && (
              <TestStep
                accessToken={accessToken}
                formDetails={formDetails}
                sheetDetails={sheetDetails}
                adminEmail={adminEmail}
                onRefreshLeads={refreshLeads}
                onNavigateToCRM={() => setActiveTab('crm')}
              />
            )}

            {/* Leads Pipeline CRM View */}
            {activeTab === 'crm' && (
              <CrmDashboard
                accessToken={accessToken}
                leads={leads}
                sheetDetails={sheetDetails}
                formDetails={formDetails}
                adminEmail={adminEmail}
                onRefreshLeads={refreshLeads}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Add Client Modal */}
      {accessToken && (
        <AddClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          accessToken={accessToken}
          spreadsheetId={sheetDetails?.spreadsheetId || null}
          sheetName={sheetDetails?.sheetName || 'Clients'}
          adminEmail={adminEmail}
          onClientAdded={refreshLeads}
        />
      )}

      {/* Vibrant Palette Footer */}
      <footer className="bg-slate-900 border-t-4 border-indigo-500 py-6 px-4 sm:px-8 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6 sm:space-x-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                System Status
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-black text-xs uppercase tracking-wide">
                  CRM Flow Active
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800"></div>

            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Managed Pipeline
              </span>
              <span className="text-white font-black text-xs">
                {leads.length} Records in Sheets
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex flex-col hidden sm:flex">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Automation Route
              </span>
              <span className="text-indigo-300 font-bold text-xs">
                Forms → Sheets → Gmail
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              Admin: <span className="text-slate-200 font-mono font-semibold">{adminEmail}</span>
            </span>
            <div className="px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-black uppercase tracking-wider">
              Google Workspace
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
