export interface ClientLead {
  id?: string;
  rowIndex?: number;
  timestamp: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  budget: string;
  notes: string;
  status: 'New Lead' | 'Contacted' | 'Proposal Sent' | 'Closed Won' | 'Closed Lost';
  welcomeSent: string;
}

export interface GoogleFormDetails {
  formId: string;
  title: string;
  description?: string;
  responderUri: string;
  editUri?: string;
  items: Array<{
    itemId: string;
    title: string;
    questionItem?: {
      question: {
        questionId: string;
        required?: boolean;
        textQuestion?: {
          paragraph?: boolean;
        };
        choiceQuestion?: {
          type: string;
          options: Array<{ value: string }>;
        };
      };
    };
  }>;
}

export interface GoogleSheetDetails {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheetName: string;
  rowCount: number;
}

export interface TestStepResult {
  step: 'form' | 'sheet' | 'script' | 'verify';
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface CrmConfig {
  formId: string | null;
  formTitle: string;
  formUrl: string | null;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  sheetName: string;
  adminEmail: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  autoSendInApp: boolean;
}
