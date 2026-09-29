import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Send,
  ExternalLink,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Briefcase,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ClientLead, GoogleSheetDetails, GoogleFormDetails } from '../types';
import { updateClientInSheet } from '../services/googleSheets';
import { sendWelcomeEmailViaGmail } from '../services/gmail';

interface CrmDashboardProps {
  accessToken: string;
  leads: ClientLead[];
  sheetDetails: GoogleSheetDetails | null;
  formDetails: GoogleFormDetails | null;
  adminEmail: string;
  onRefreshLeads: () => Promise<void>;
  onOpenAddModal: () => void;
}

export const CrmDashboard: React.FC<CrmDashboardProps> = ({
  accessToken,
  leads,
  sheetDetails,
  formDetails,
  adminEmail,
  onRefreshLeads,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingRowIndex, setUpdatingRowIndex] = useState<number | null>(null);

  // Email Modal State
  const [emailModalLead, setEmailModalLead] = useState<ClientLead | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessToast, setEmailSuccessToast] = useState<string | null>(null);

  const handleStatusChange = async (lead: ClientLead, newStatus: string) => {
    if (!sheetDetails || !lead.rowIndex) return;
    setUpdatingRowIndex(lead.rowIndex);
    try {
      await updateClientInSheet(
        accessToken,
        sheetDetails.spreadsheetId,
        lead.rowIndex,
        { status: newStatus },
        sheetDetails.sheetName
      );
      await onRefreshLeads();
    } catch (err) {
      console.error('Failed to update status in Google Sheet', err);
    } finally {
      setUpdatingRowIndex(null);
    }
  };

  const openEmailModal = (lead: ClientLead) => {
    setEmailModalLead(lead);
    setEmailSubject(`Follow-Up: Discussion with ${lead.name} regarding ${lead.service || 'your project'}`);
    setEmailBody(
      `<p>Hi ${lead.name},</p><p>I wanted to follow up on your recent inquiry regarding <strong>${lead.service || 'our services'}</strong>.</p><p>Are you free for a quick 15-minute discovery call this week to discuss your goals and timeline?</p><p>Best regards,<br><strong>Kezia Naicker</strong><br>${adminEmail}</p>`
    );
  };

  const handleSendCustomEmail = async () => {
    if (!emailModalLead) return;
    setIsSendingEmail(true);
    try {
      await sendWelcomeEmailViaGmail(accessToken, {
        toEmail: emailModalLead.email,
        clientName: emailModalLead.name,
        companyName: emailModalLead.company,
        service: emailModalLead.service,
        adminEmail: adminEmail,
        customSubject: emailSubject,
        customBody: emailBody,
      });

      // Update sheet status to Contacted if still New Lead
      if (emailModalLead.status === 'New Lead' && sheetDetails && emailModalLead.rowIndex) {
        await updateClientInSheet(
          accessToken,
          sheetDetails.spreadsheetId,
          emailModalLead.rowIndex,
          { status: 'Contacted' },
          sheetDetails.sheetName
        );
        await onRefreshLeads();
      }

      setEmailSuccessToast(`Email successfully sent to ${emailModalLead.email}!`);
      setTimeout(() => setEmailSuccessToast(null), 4000);
      setEmailModalLead(null);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to send email: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshLeads();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Metrics calculation
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New Lead').length;
  const contactedLeads = leads.filter((l) => l.status === 'Contacted').length;
  const wonLeads = leads.filter((l) => l.status === 'Closed Won').length;
  const welcomeSentCount = leads.filter(
    (l) =>
      l.welcomeSent?.toLowerCase().includes('yes') ||
      l.welcomeSent?.toLowerCase().includes('sent')
  ).length;

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-[2rem] border-4 border-indigo-100 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Total Client Leads
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {totalLeads}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">
            Recorded in Google Sheets
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border-4 border-amber-100 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              New Inquiries
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {newLeads}
          </div>
          <div className="text-xs font-bold text-amber-600 mt-1">
            Pending discovery follow-up
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border-4 border-emerald-100 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Welcome Emails Sent
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {welcomeSentCount}
          </div>
          <div className="text-xs font-bold text-emerald-600 mt-1">
            Automated delivery rate: {totalLeads > 0 ? Math.round((welcomeSentCount / totalLeads) * 100) : 100}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border-4 border-purple-100 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Closed Won
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {wonLeads}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">
            Converted active clients
          </div>
        </div>
      </div>

      {emailSuccessToast && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border-2 border-emerald-200 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{emailSuccessToast}</span>
        </div>
      )}

      {/* Main CRM Table Container */}
      <div className="bg-white rounded-[2.5rem] border-4 border-slate-100 shadow-xl overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-6 sm:p-8 border-b-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-indigo-200">
                Live Directory
              </span>
            </div>
            <h3 className="font-black text-2xl text-slate-900 tracking-tight">
              Client Pipeline & Directory
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Live bi-directional sync with Google Sheet: <span className="font-bold text-slate-600">{sheetDetails?.title || 'Clients'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {formDetails && (
              <a
                href={formDetails.responderUri}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-indigo-100"
              >
                <span>Intake Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {sheetDetails && (
              <a
                href={sheetDetails.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-emerald-200"
              >
                <span>Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              id="crm-sync-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            <button
              id="crm-add-client-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-200 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-5 bg-slate-50/80 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by name, email, company, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider">Status:</span>
            {['ALL', 'New Lead', 'Contacted', 'Proposal Sent', 'Closed Won', 'Closed Lost'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-indigo-50/60 text-indigo-950 font-black uppercase tracking-wider text-[11px] border-b-2 border-slate-100">
              <tr>
                <th className="px-5 py-4">Client Details</th>
                <th className="px-5 py-4">Company & Contact</th>
                <th className="px-5 py-4">Service & Budget</th>
                <th className="px-5 py-4">Notes & Details</th>
                <th className="px-5 py-4">Pipeline Status</th>
                <th className="px-5 py-4">Welcome Email</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 bg-white">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead, idx) => (
                  <tr
                    key={lead.id || idx}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-black text-slate-900 text-xs">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-indigo-600 font-mono font-bold">
                        {lead.email}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {lead.timestamp}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-slate-800 font-bold">
                        {lead.company || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {lead.phone || '—'}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {lead.service || 'General Inquiry'}
                      </span>
                      {lead.budget && (
                        <div className="text-[11px] text-emerald-600 font-black mt-1">
                          Budget: {lead.budget}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-[11px] text-slate-600 font-medium line-clamp-2">
                        {lead.notes || '—'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead, e.target.value)}
                        disabled={updatingRowIndex === lead.rowIndex}
                        className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border-2 focus:outline-none cursor-pointer ${
                          lead.status === 'Closed Won'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : lead.status === 'Proposal Sent'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : lead.status === 'Contacted'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : lead.status === 'Closed Lost'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          lead.welcomeSent?.toLowerCase().includes('yes') ||
                          lead.welcomeSent?.toLowerCase().includes('sent')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{lead.welcomeSent}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEmailModal(lead)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-indigo-100"
                        title="Send direct email via Gmail API"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-slate-400"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-xs text-slate-600">
                        No client leads matching criteria
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Add a client manually or run the Step 4 verification pipeline!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Email Compose Modal */}
      {emailModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] border-4 border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-inner">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-base text-white">
                    Send Email to {emailModalLead.name}
                  </h4>
                  <span className="text-[11px] text-indigo-300 font-mono">
                    {emailModalLead.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEmailModalLead(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 rounded-lg bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  To:
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${emailModalLead.name} <${emailModalLead.email}>`}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2 text-xs text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject:
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Message HTML:
                </label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-2xl p-4 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                <span className="text-[11px] font-medium text-slate-400">
                  Sends directly from your Gmail ({adminEmail})
                </span>
                <button
                  onClick={handleSendCustomEmail}
                  disabled={isSendingEmail}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSendingEmail ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSendingEmail ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
