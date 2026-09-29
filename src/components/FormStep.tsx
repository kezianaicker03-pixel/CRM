import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Link2,
} from 'lucide-react';
import { GoogleFormDetails } from '../types';
import { createCRMForm, getFormDetails } from '../services/googleForms';

interface FormStepProps {
  accessToken: string;
  formDetails: GoogleFormDetails | null;
  onFormCreated: (form: GoogleFormDetails) => void;
  onNextStep: () => void;
  formTitle: string;
  setFormTitle: (t: string) => void;
}

export const FormStep: React.FC<FormStepProps> = ({
  accessToken,
  formDetails,
  onFormCreated,
  onNextStep,
  formTitle,
  setFormTitle,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customFormId, setCustomFormId] = useState('');
  const [isConnectingExisting, setIsConnectingExisting] = useState(false);

  const handleCreateForm = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const form = await createCRMForm(accessToken, formTitle || 'Client Intake Form - CRM');
      onFormCreated(form);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create Google Form');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = async () => {
    if (!customFormId.trim()) return;
    setIsConnectingExisting(true);
    setError(null);
    try {
      // Extract form ID if a URL was pasted
      let extractedId = customFormId.trim();
      const match = extractedId.match(/forms\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        extractedId = match[1];
      }

      const form = await getFormDetails(accessToken, extractedId);
      onFormCreated(form);
      setCustomFormId('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect existing Google Form');
    } finally {
      setIsConnectingExisting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Card */}
      <div className="bg-white rounded-[2.5rem] border-4 border-indigo-100 p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-indigo-500 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
                Step 1: The Intake
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Client Intelligence Capture
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Google Form Intake
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mt-1 max-w-2xl font-medium">
              Initial capture of new client intelligence via a secure web interface. Submitting this form captures client names, email addresses, phone numbers, and project specifications.
            </p>
          </div>

          {!formDetails && (
            <div className="flex items-center space-x-3 shrink-0">
              <button
                id="create-form-btn"
                onClick={handleCreateForm}
                disabled={isCreating}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>{isCreating ? 'Generating Form in Drive...' : '1-Click Create Connected Form'}</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}
      </div>

      {formDetails ? (
        /* Connected Form Card */
        <div className="bg-white rounded-[2.5rem] border-4 border-indigo-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/20 flex items-center justify-center text-white shadow-inner">
                <FileText className="w-7 h-7 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-xl text-white">
                    {formDetails.title}
                  </h3>
                  <span className="px-3 py-1 text-[10px] font-black bg-emerald-500 text-white rounded-full uppercase tracking-wider shadow-sm">
                    Active & Linked
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-1 font-mono">
                  Form ID: {formDetails.formId}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                id="open-form-editor-link"
                href={formDetails.editUri || `https://docs.google.com/forms/d/${formDetails.formId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <span>Edit in Google Forms</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                id="open-responder-form-link"
                href={formDetails.responderUri}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                <span>Open Public Intake</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Shareable Link Box */}
            <div className="bg-indigo-50/70 p-5 rounded-3xl border-2 border-indigo-100">
              <label className="block text-xs font-black uppercase tracking-wider text-indigo-700 mb-2">
                Public Client Responder Link (Share with clients)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={formDetails.responderUri}
                  className="flex-1 bg-white border-2 border-indigo-200 rounded-2xl px-4 py-2.5 text-xs font-mono text-slate-800 select-all focus:outline-none"
                />
                <button
                  id="copy-form-url-btn"
                  onClick={() => copyToClipboard(formDetails.responderUri)}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md shadow-indigo-200 transition-all cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Questions Configured in this Form */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  Form Fields & Intake Schema ({formDetails.items.length} Questions)
                </h4>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  Pre-configured CRM Schema
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {formDetails.items.length > 0 ? (
                  formDetails.items.map((item, idx) => (
                    <div
                      key={item.itemId || idx}
                      className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-start space-x-3 hover:border-indigo-200 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {item.questionItem?.question?.choiceQuestion
                            ? 'Choice Selection'
                            : item.questionItem?.question?.textQuestion?.paragraph
                            ? 'Multi-line Paragraph'
                            : 'Single-line Text Field'}
                          {item.questionItem?.question?.required && (
                            <span className="ml-1.5 text-rose-500 font-black">*Required</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl">
                    Standard CRM questions configured (Full Name, Email, Company, Phone, Service, Budget, Project Details).
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Next Step CTA */}
            <div className="pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs font-bold text-slate-500">
                Form intake ready. Next step: connect the Google Sheet database.
              </p>
              <button
                id="form-to-sheet-next-btn"
                onClick={onNextStep}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-200 transition-all cursor-pointer shrink-0"
              >
                <span>Proceed to Step 2: Google Sheet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Uncreated Form State with Options */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-indigo-100 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-4 left-8 bg-indigo-500 text-white px-4 py-1 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
              Option A • Recommended
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 mt-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">
                Generate Instant Client Intake Form
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed mb-5">
                Automatically builds a new Google Form in your Google Drive with fields tailored for client onboarding:
              </p>

              <div className="bg-indigo-50/70 p-5 rounded-3xl border-2 border-dashed border-indigo-200 mb-6 space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-400 uppercase">Field 01</label>
                  <div className="h-9 bg-white rounded-xl border-2 border-indigo-100 flex items-center px-3 text-xs font-bold text-slate-700">
                    Full Name (Client Contact)
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-400 uppercase">Field 02</label>
                  <div className="h-9 bg-white rounded-xl border-2 border-indigo-100 flex items-center px-3 text-xs font-bold text-slate-700">
                    Email Address (For automated welcome email)
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-indigo-400 uppercase">Field 03</label>
                  <div className="h-9 bg-white rounded-xl border-2 border-indigo-100 flex items-center px-3 text-xs font-bold text-slate-700">
                    Company, Phone, Service & Budget
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Form Title:
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 mb-4 focus:bg-white focus:border-indigo-500 focus:outline-none"
                placeholder="Client Intake Form - CRM"
              />

              <button
                id="generate-new-form-action-btn"
                onClick={handleCreateForm}
                disabled={isCreating}
                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{isCreating ? 'Creating Form in Drive...' : 'SUBMIT & CREATE FORM'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-200 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-4 left-8 bg-slate-600 text-white px-4 py-1 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
              Option B • Existing Form
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 mt-2">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">
                Or Connect Existing Google Form
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
                Already have a client form in Google Drive? Paste its Form ID or edit URL below to connect it directly to the CRM pipeline.
              </p>

              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Google Form ID or URL:
              </label>
              <input
                type="text"
                value={customFormId}
                onChange={(e) => setCustomFormId(e.target.value)}
                placeholder="e.g. 1FAIpQLSc... or paste https://docs.google.com/forms/d/..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 mb-4 focus:bg-white focus:border-slate-500 focus:outline-none"
              />
            </div>

            <button
              id="connect-existing-form-btn"
              onClick={handleConnectExisting}
              disabled={isConnectingExisting || !customFormId.trim()}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isConnectingExisting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              <span>{isConnectingExisting ? 'Linking Form...' : 'LINK EXISTING FORM'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
