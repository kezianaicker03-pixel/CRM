import React, { useState } from 'react';
import {
  Sheet as SheetIcon,
  Plus,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Table,
  CheckCircle2,
  Search,
  UserPlus,
} from 'lucide-react';
import { ClientLead, GoogleSheetDetails } from '../types';
import {
  createCRMSpreadsheet,
  getSpreadsheetDetails,
  getClientLeadsFromSheet,
  CRM_HEADERS,
} from '../services/googleSheets';

interface SheetStepProps {
  accessToken: string;
  sheetDetails: GoogleSheetDetails | null;
  leads: ClientLead[];
  onSheetCreated: (sheet: GoogleSheetDetails) => void;
  onRefreshLeads: () => Promise<void>;
  onNextStep: () => void;
  onOpenAddModal: () => void;
}

export const SheetStep: React.FC<SheetStepProps> = ({
  accessToken,
  sheetDetails,
  leads,
  onSheetCreated,
  onRefreshLeads,
  onNextStep,
  onOpenAddModal,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customSheetId, setCustomSheetId] = useState('');
  const [isConnectingExisting, setIsConnectingExisting] = useState(false);

  const handleCreateSheet = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const sheet = await createCRMSpreadsheet(accessToken, 'Client CRM Database');
      onSheetCreated(sheet);
      await onRefreshLeads();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create Google Spreadsheet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = async () => {
    if (!customSheetId.trim()) return;
    setIsConnectingExisting(true);
    setError(null);
    try {
      let extractedId = customSheetId.trim();
      const match = extractedId.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        extractedId = match[1];
      }

      const sheet = await getSpreadsheetDetails(accessToken, extractedId);
      onSheetCreated(sheet);
      await onRefreshLeads();
      setCustomSheetId('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect Google Spreadsheet');
    } finally {
      setIsConnectingExisting(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshLeads();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const query = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.company.toLowerCase().includes(query) ||
      lead.service.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Explanation */}
      <div className="bg-white rounded-[2.5rem] border-4 border-emerald-100 p-6 sm:p-8 shadow-xl relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
                Step 2: The Core
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Database Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Google Sheets CRM Database
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mt-1 max-w-2xl font-medium">
              Where every submission is automatically saved as a new row. The spreadsheet acts as the central source of truth for your client records and email statuses.
            </p>
          </div>

          {!sheetDetails && (
            <button
              id="create-sheet-btn"
              onClick={handleCreateSheet}
              disabled={isCreating}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{isCreating ? 'Creating Spreadsheet...' : '1-Click Create CRM Spreadsheet'}</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}
      </div>

      {sheetDetails ? (
        /* Connected Sheet View */
        <div className="bg-white rounded-[2.5rem] border-4 border-emerald-100 shadow-xl overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/20 flex items-center justify-center text-white shadow-inner">
                <SheetIcon className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-xl text-white">
                    {sheetDetails.title}
                  </h3>
                  <span className="px-3 py-1 text-[10px] font-black bg-emerald-500 text-white rounded-full uppercase tracking-wider shadow-sm">
                    {leads.length} Records
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-1 font-mono">
                  Spreadsheet ID: {sheetDetails.spreadsheetId}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                id="refresh-sheet-leads-btn"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span>Sync Rows</span>
              </button>

              <a
                id="open-sheet-in-tab-link"
                href={sheetDetails.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                <span>Open in Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Controls & Table */}
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client, email, company, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="add-client-manual-btn"
                  onClick={onOpenAddModal}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md shadow-indigo-200 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Lead Row</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border-2 border-emerald-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50 text-emerald-900 font-black uppercase tracking-wider text-[11px] border-b-2 border-emerald-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3.5">Row</th>
                      <th className="px-4 py-3.5">Timestamp</th>
                      <th className="px-4 py-3.5">Client Name</th>
                      <th className="px-4 py-3.5">Email</th>
                      <th className="px-4 py-3.5">Company</th>
                      <th className="px-4 py-3.5">Service</th>
                      <th className="px-4 py-3.5">Budget</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Welcome Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100 bg-white">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead, idx) => (
                        <tr
                          key={lead.id || idx}
                          className="hover:bg-indigo-50/40 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-slate-400 font-mono font-bold text-[11px]">
                            #{lead.rowIndex || idx + 2}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            {lead.timestamp}
                          </td>
                          <td className="px-4 py-3.5 font-black text-slate-900">
                            {lead.name}
                          </td>
                          <td className="px-4 py-3.5 text-indigo-600 font-mono font-bold text-[11px]">
                            {lead.email}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium">
                            {lead.company || '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {lead.service || 'General'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-emerald-600 font-black">
                            {lead.budget || '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                lead.welcomeSent?.toLowerCase().includes('yes') ||
                                lead.welcomeSent?.toLowerCase().includes('sent')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {lead.welcomeSent}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-12 text-center text-slate-400"
                        >
                          <div className="max-w-xs mx-auto space-y-2">
                            <SheetIcon className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="font-bold text-xs text-slate-600">
                              No client records found in Google Sheet yet
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Submissions from Google Form or test submissions will appear here instantly.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Next Step CTA */}
            <div className="pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs font-bold text-slate-500">
                Sheet is ready! Next step: configure the Google Apps Script email automation.
              </p>
              <button
                id="sheet-to-script-next-btn"
                onClick={onNextStep}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-200 transition-all cursor-pointer shrink-0"
              >
                <span>Proceed to Step 3: Apps Script Trigger</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Connection Options */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-emerald-100 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-4 left-8 bg-emerald-500 text-white px-4 py-1 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
              Option A • Recommended
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 mt-2">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">
                Create New Google Sheet CRM
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed mb-5">
                We'll initialize a formatted spreadsheet with pre-configured headers, frozen rows, and status tracking columns:
              </p>

              <div className="bg-emerald-50/70 p-5 rounded-3xl border-2 border-dashed border-emerald-200 text-xs font-bold text-slate-700 mb-6 space-y-1.5">
                {CRM_HEADERS.map((h, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-emerald-500 font-mono text-[11px]">0{i + 1}.</span>
                    <span className="font-bold text-slate-800">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              id="init-new-sheet-btn"
              onClick={handleCreateSheet}
              disabled={isCreating}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isCreating ? 'Creating Sheet...' : 'CREATE CRM SHEET IN DRIVE'}</span>
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-200 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-4 left-8 bg-slate-600 text-white px-4 py-1 rounded-full font-black text-xs uppercase tracking-wider shadow-md">
              Option B • Existing Sheet
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 mt-2">
                <Table className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">
                Or Connect Existing Google Sheet
              </h3>
              <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
                Have an existing spreadsheet? Enter its Spreadsheet ID or URL to link it with this CRM.
              </p>

              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Google Sheet ID or URL:
              </label>
              <input
                type="text"
                value={customSheetId}
                onChange={(e) => setCustomSheetId(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRA5nFM... or paste URL"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 mb-4 focus:bg-white focus:outline-none focus:border-slate-500"
              />
            </div>

            <button
              id="connect-existing-sheet-btn"
              onClick={handleConnectExisting}
              disabled={isConnectingExisting || !customSheetId.trim()}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isConnectingExisting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Table className="w-4 h-4" />
              )}
              <span>{isConnectingExisting ? 'Connecting...' : 'CONNECT EXISTING SHEET'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
