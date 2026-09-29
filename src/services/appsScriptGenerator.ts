export interface AppsScriptConfig {
  spreadsheetId?: string;
  sheetName?: string;
  adminEmail: string;
  senderName?: string;
}

export function generateGoogleAppsScript(config: AppsScriptConfig): string {
  const adminEmail = config.adminEmail || 'kezianaicker24@gmail.com';
  const sheetName = config.sheetName || 'Clients';
  const spreadsheetId = config.spreadsheetId || '';

  return `/**
 * ============================================================================
 * GOOGLE WORKSPACE CRM - AUTOMATED CLIENT WELCOME SCRIPT
 * ============================================================================
 * Owner / Admin Email: ${adminEmail}
 * Connected Sheet: ${sheetName}
 * ${spreadsheetId ? `Spreadsheet ID: ${spreadsheetId}` : ''}
 * 
 * HOW TO INSTALL IN 3 SIMPLE STEPS:
 * 1. In your Google Sheet, click "Extensions" > "Apps Script"
 * 2. Delete any default code in Code.gs, paste this entire script, and click Save (Ctrl+S / Cmd+S).
 * 3. Click the "Triggers" (alarm clock icon on left sidebar) > "+ Add Trigger":
 *    - Function to run: onFormSubmit
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 *    - Click Save and grant permissions when prompted.
 * ============================================================================
 */

// Configuration constants
var ADMIN_EMAIL = "${adminEmail}";
var SENDER_NAME = "Kezia Naicker | Client Relations";
var SHEET_NAME = "${sheetName}";

/**
 * Triggered automatically every time a new client submits the Google Form.
 * Handles reading the new submission, sending the welcome email, and updating the sheet.
 */
function onFormSubmit(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSheet();
    var lastRow = sheet.getLastRow();
    
    var clientName = "Valued Client";
    var clientEmail = "";
    var company = "";
    var service = "General Inquiry";
    var budget = "";
    var notes = "";
    
    // Check if event object contains namedValues (from Google Form linked sheet)
    if (e && e.namedValues) {
      clientName = getFieldValue(e.namedValues, ['Full Name', 'Client Name', 'Name', 'What is your name?']) || clientName;
      clientEmail = getFieldValue(e.namedValues, ['Email Address', 'Email', 'Your Email', 'Contact Email']);
      company = getFieldValue(e.namedValues, ['Company / Organization', 'Company', 'Organization', 'Business']);
      service = getFieldValue(e.namedValues, ['Service of Interest', 'Service', 'Interested In']);
      budget = getFieldValue(e.namedValues, ['Estimated Budget', 'Budget', 'Project Budget']);
      notes = getFieldValue(e.namedValues, ['Project Details & Goals', 'Notes', 'Message', 'Details']);
    } else if (lastRow > 1) {
      // Fallback: Read the last submitted row directly from the sheet
      var rowValues = sheet.getRange(lastRow, 1, 1, 10).getValues()[0];
      clientName = rowValues[1] || clientName;
      clientEmail = rowValues[2] || "";
      company = rowValues[3] || "";
      service = rowValues[5] || "General Inquiry";
      budget = rowValues[6] || "";
      notes = rowValues[7] || "";
    }

    if (!clientEmail || clientEmail.indexOf('@') === -1) {
      Logger.log("No valid client email found in submission row " + lastRow);
      return;
    }

    // 1. Send Personalized HTML Welcome Email to the Client
    var subject = "Thank you for reaching out, " + clientName + " - Welcome to our Client Portal!";
    var htmlBody = buildWelcomeEmailHtml(clientName, company, service, budget);

    GmailApp.sendEmail(clientEmail, subject, "", {
      name: SENDER_NAME,
      htmlBody: htmlBody,
      replyTo: ADMIN_EMAIL,
      bcc: ADMIN_EMAIL // Keeps admin notified on every incoming lead
    });

    Logger.log("Successfully sent welcome email to: " + clientEmail);

    // 2. Mark "Welcome Email Sent" and Status in the Google Sheet
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    
    // Column 9 = Status (New Lead), Column 10 = Welcome Email Sent
    sheet.getRange(lastRow, 9).setValue("New Lead");
    sheet.getRange(lastRow, 10).setValue("Sent: " + timestamp);

  } catch (error) {
    Logger.log("Error processing form submission: " + error.toString());
    // Alert the owner if something went wrong
    try {
      MailApp.sendEmail(ADMIN_EMAIL, "CRM Automation Alert: Form Submission Error", "Error details: " + error.toString());
    } catch(e) {}
  }
}

/**
 * Helper to safely extract values from namedValues with case-insensitive matching
 */
function getFieldValue(namedValues, fieldAliases) {
  for (var key in namedValues) {
    for (var i = 0; i < fieldAliases.length; i++) {
      if (key.toLowerCase().trim() === fieldAliases[i].toLowerCase().trim()) {
        var val = namedValues[key];
        return Array.isArray(val) ? val[0] : val;
      }
    }
  }
  return "";
}

/**
 * Builds a clean, responsive HTML email template for new clients
 */
function buildWelcomeEmailHtml(clientName, company, service, budget) {
  var companyInfo = company ? "<p style='margin: 4px 0; color: #475569;'><strong>Company:</strong> " + escapeHtml(company) + "</p>" : "";
  var serviceInfo = service ? "<p style='margin: 4px 0; color: #475569;'><strong>Service:</strong> " + escapeHtml(service) + "</p>" : "";
  var budgetInfo = budget ? "<p style='margin: 4px 0; color: #475569;'><strong>Estimated Budget:</strong> " + escapeHtml(budget) + "</p>" : "";

  return "<!DOCTYPE html>" +
    "<html>" +
    "<head><meta charset='utf-8'></head>" +
    "<body style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px 0; margin: 0;'>" +
    "  <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;'>" +
    "    <div style='background: linear-gradient(135deg, #1e40af, #2563eb); padding: 32px 28px; color: #ffffff;'>" +
    "      <h1 style='margin: 0 0 6px 0; font-size: 22px; font-weight: 700;'>Welcome & Thank You!</h1>" +
    "      <p style='margin: 0; font-size: 14px; opacity: 0.9;'>We have received your client intake form.</p>" +
    "    </div>" +
    "    <div style='padding: 28px; color: #1e293b; font-size: 15px; line-height: 1.6;'>" +
    "      <p>Hi <strong>" + escapeHtml(clientName) + "</strong>,</p>" +
    "      <p>Thank you for submitting your details. We are excited about the opportunity to collaborate with you.</p>" +
    "      <div style='background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 14px 18px; margin: 18px 0; border-radius: 4px;'>" +
    "        <p style='margin: 0 0 8px 0; font-weight: 600; color: #0f172a;'>Submitted Inquiry Overview:</p>" +
    companyInfo +
    serviceInfo +
    budgetInfo +
    "      </div>" +
    "      <p><strong>What happens next?</strong></p>" +
    "      <ul style='padding-left: 20px; color: #334155;'>" +
    "        <li>Our team will review your inquiry details.</li>" +
    "        <li>We will follow up within 24 hours to schedule our discovery call.</li>" +
    "        <li>We'll outline tailored next steps to achieve your goals.</li>" +
    "      </ul>" +
    "      <p>Need to add more details? Feel free to reply directly to this email or reach us at <a href='mailto:" + ADMIN_EMAIL + "' style='color: #2563eb;'>" + ADMIN_EMAIL + "</a>.</p>" +
    "      <p style='margin-top: 28px;'>Warm regards,<br><strong>" + SENDER_NAME + "</strong></p>" +
    "    </div>" +
    "    <div style='background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;'>" +
    "      <p style='margin: 0;'>Automated Client Relationship Management via Google Workspace</p>" +
    "    </div>" +
    "  </div>" +
    "</body>" +
    "</html>";
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * TEST FUNCTION: Run this in the Apps Script editor (Select testSendWelcomeEmail > Click Run)
 * to verify email delivery to ${adminEmail} immediately!
 */
function testSendWelcomeEmail() {
  var testEmail = ADMIN_EMAIL;
  var testName = "Test Client (Kezia Naicker)";
  
  Logger.log("Sending test welcome email to " + testEmail + "...");
  var subject = "[TEST] Thank you for reaching out, " + testName + "!";
  var html = buildWelcomeEmailHtml(testName, "Acme Corporation", "Consulting & Strategy", "$5,000 - $15,000");
  
  GmailApp.sendEmail(testEmail, subject, "", {
    name: SENDER_NAME,
    htmlBody: html,
    replyTo: ADMIN_EMAIL
  });
  
  Logger.log("Test email sent successfully! Check your inbox at " + testEmail);
}
`;
}
