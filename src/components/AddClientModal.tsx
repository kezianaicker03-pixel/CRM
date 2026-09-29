import React, { useState } from 'react';
import { UserPlus, X, RefreshCw, Send, Check } from 'lucide-react';
import { ClientLead } from '../types';
import { appendClientToSheet } from '../services/googleSheets';
import { sendWelcomeEmailViaGmail } from '../services/gmail';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  spreadsheetId: string | null;
  sheetName: string;
  adminEmail: string;
  onClientAdded: () => Promise<void>;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  spreadsheetId,
  sheetName,
  adminEmail,
  onClientAdded,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Consulting & Strategy');
  const [budget, setBudget] = useState('$1,000 - $5,000');
  const [notes, setNotes] = useState('');
  const [sendEmailImmediately, setSendEmailImmediately] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spreadsheetId) {
      setError('Please create or connect a Google Sheet first.');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError('Client Name and Email Address are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let welcomeStatus = 'No';
      if (sendEmailImmediately) {
        welcomeStatus = `Sent: ${new Date().toLocaleDateString()}`;
        // Send email via Gmail API
        await sendWelcomeEmailViaGmail(accessToken, {
          toEmail: email,
          clientName: name,
          companyName: company,
          service: service,
          adminEmail: adminEmail,
        });
      }

      // Append row to Google Sheets
      await appendClientToSheet(
        accessToken,
        spreadsheetId,
        {
          timestamp: new Date().toLocaleString(),
          name,
          email,
          company,
          phone,
          service,
          budget,
          notes,
          status: 'New Lead',
          welcomeSent: welcomeStatus,
        },
        sheetName
      );

      await onClientAdded();
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setNotes('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] border-4 border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">Add New Client Lead</h3>
              <p className="text-[11px] text-slate-400">Directly syncs to Google Sheets & Gmail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold border-2 border-rose-200 rounded-2xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Client Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Smith"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@company.com"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Corp"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Service of Interest
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Consulting & Strategy">Consulting & Strategy</option>
                <option value="Web & App Development">Web & App Development</option>
                <option value="Design & Branding">Design & Branding</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Ongoing Support">Ongoing Support</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Estimated Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="< $1,000">&lt; $1,000</option>
                <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                <option value="$15,000+">$15,000+</option>
                <option value="Flexible / Undecided">Flexible / Undecided</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Project Notes / Details
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Initial requirements, key milestones..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Email Option Checkbox */}
          <div className="p-4 bg-indigo-50/70 border-2 border-indigo-100 rounded-2xl flex items-center space-x-3">
            <input
              type="checkbox"
              id="send-email-immediately"
              checked={sendEmailImmediately}
              onChange={(e) => setSendEmailImmediately(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
            <label
              htmlFor="send-email-immediately"
              className="text-xs text-indigo-950 font-bold cursor-pointer"
            >
              Automatically send personalized welcome email via Gmail right now
            </label>
          </div>

          <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? 'Saving to Google Sheet...' : 'Add Client to Sheet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
