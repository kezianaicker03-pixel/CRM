import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Settings,
} from 'lucide-react';
import { GoogleSheetDetails } from '../types';
import { generateGoogleAppsScript } from '../services/appsScriptGenerator';
import { sendWelcomeEmailViaGmail } from '../services/gmail';

interface ScriptStepProps {
  accessToken: string;
  sheetDetails: GoogleSheetDetails | null;
  adminEmail: string;
  onNextStep: () => void;
}

export const ScriptStep: React.FC<ScriptStepProps> = ({
  accessToken,
  sheetDetails,
  adminEmail,
  onNextStep,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  const scriptCode = generateGoogleAppsScript({
    adminEmail: adminEmail || 'kezianaicker24@gmail.com',
    spreadsheetId: sheetDetails?.spreadsheetId,
    sheetName: sheetDetails?.sheetName || 'Clients',
    senderName: 'Kezia Naicker | Client Relations',
  });

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectTestEmail = async () => {
    setIsSendingTest(true);
    setTestEmailStatus(null);
    try {
      await sendWelcomeEmailViaGmail(accessToken, {
        toEmail: adminEmail,
        clientName: 'Kezia Naicker (Test)',
        companyName: 'Acme Growth Labs',
        service: 'Consulting & Strategy',
        adminEmail: adminEmail,
        customSubject: `[TEST WELCOME] In-App Gmail Verification - Welcome to our CRM!`,
      });
      setTestEmailStatus(`Welcome email successfully sent to ${adminEmail}! Check your inbox.`);
    } catch (err: any) {
      console.error(err);
      setTestEmailStatus(`Failed to send test email: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Card */}
      <div className="bg-white rounded-[2.5rem] border-4 border-amber-100 p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
                Step 3: The Pulse
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Automated Gmail Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Google Apps Script Email Trigger
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mt-1 max-w-2xl font-medium">
              Automatically emails the client a customized welcome message the moment they submit the form, alerts <strong>{adminEmail}</strong>, and logs status in the Google Sheet.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="copy-script-top-btn"
              onClick={handleCopyScript}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-200 hover:shadow-amber-300 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Script Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Apps Script Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Setup Guide */}
      <div className="bg-white rounded-[2.5rem] border-4 border-indigo-100 p-6 sm:p-8 shadow-xl">
        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center space-x-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>How to Install in Your Google Sheet (60-Second Setup)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-indigo-50/70 p-6 rounded-3xl border-2 border-indigo-100 relative">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs mb-3 shadow-md shadow-indigo-200">
              01
            </div>
            <h4 className="font-black text-slate-900 text-sm mb-1.5">
              Open Script Editor
            </h4>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              In your linked Google Sheet, click top menu: <strong>Extensions</strong> →{' '}
              <strong>Apps Script</strong>.
            </p>
            {sheetDetails?.spreadsheetUrl && (
              <a
                href={sheetDetails.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 font-black uppercase tracking-wider hover:underline mt-3"
              >
                <span>Open your Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="bg-amber-50/70 p-6 rounded-3xl border-2 border-amber-100 relative">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xs mb-3 shadow-md shadow-amber-200">
              02
            </div>
            <h4 className="font-black text-slate-900 text-sm mb-1.5">
              Paste Code & Save
            </h4>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Clear any default code in <span className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 font-bold">Code.gs</span>, paste the generated script below, and click <strong>Save</strong> (Ctrl+S / Cmd+S).
            </p>
          </div>

          <div className="bg-emerald-50/70 p-6 rounded-3xl border-2 border-emerald-100 relative">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs mb-3 shadow-md shadow-emerald-200">
              03
            </div>
            <h4 className="font-black text-slate-900 text-sm mb-1.5">
              Set "On Form Submit" Trigger
            </h4>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Click <strong>Triggers</strong> (alarm clock on left) →{' '}
              <strong>+ Add Trigger</strong>:
              <br />
              • Function: <span className="font-mono font-bold text-emerald-800">onFormSubmit</span>
              <br />
              • Event type: <span className="font-black text-emerald-800">On form submit</span>
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-900 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        <div className="bg-slate-950 px-6 sm:px-8 py-4 border-b-2 border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300">
              Code.gs — Google Apps Script for {adminEmail}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono">
              Ready to Paste
            </span>
            <button
              id="copy-script-box-btn"
              onClick={handleCopyScript}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-x-auto max-h-[420px] font-mono text-xs leading-relaxed text-indigo-100/90 bg-slate-900/90">
          <pre>{scriptCode}</pre>
        </div>
      </div>

      {/* Instant In-App Test Dispatcher */}
      <div className="bg-white rounded-[2.5rem] border-4 border-indigo-100 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider border border-indigo-200">
                Live Dispatch
              </span>
              <h4 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <span>Verify Gmail Sending Live (Instant In-App Test)</span>
              </h4>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1 max-w-xl">
              Want to see how the client welcome email looks right now? Click below to send a real test email to <strong>{adminEmail}</strong> via Gmail API.
            </p>
          </div>

          <button
            id="send-test-email-direct-btn"
            onClick={handleDirectTestEmail}
            disabled={isSendingTest}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSendingTest ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSendingTest ? 'Sending to Inbox...' : 'Send Live Test Email Now'}</span>
          </button>
        </div>

        {testEmailStatus && (
          <div
            className={`mt-4 p-4 rounded-2xl text-xs font-bold ${
              testEmailStatus.includes('Failed')
                ? 'bg-rose-50 text-rose-700 border-2 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-2 border-emerald-200 flex items-center space-x-2'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{testEmailStatus}</span>
          </div>
        )}

        <div className="pt-6 mt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-500">
            Script ready! Next step: run the full Form → Sheet → Script → Test verification.
          </p>
          <button
            id="script-to-test-next-btn"
            onClick={onNextStep}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-200 transition-all cursor-pointer shrink-0"
          >
            <span>Proceed to Step 4: Test & Verify</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
