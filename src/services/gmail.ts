export interface WelcomeEmailParams {
  toEmail: string;
  clientName: string;
  companyName?: string;
  service?: string;
  adminEmail?: string;
  customSubject?: string;
  customBody?: string;
}

export function generateWelcomeHtml(params: WelcomeEmailParams): string {
  const { clientName, companyName, service, adminEmail } = params;
  const companyStr = companyName ? ` at <strong>${escapeHtml(companyName)}</strong>` : '';
  const serviceStr = service ? ` regarding <strong>${escapeHtml(service)}</strong>` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px 28px; text-align: left; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 32px 28px; background-color: #ffffff; }
    .lead-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; font-size: 14px; }
    .lead-box p { margin: 6px 0; }
    .footer { background-color: #f1f5f9; padding: 20px 28px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Connecting!</h1>
      <p>We received your inquiry and look forward to working together.</p>
    </div>
    <div class="content">
      <p>Hi <strong>${escapeHtml(clientName)}</strong>,</p>
      <p>Thank you for submitting your details${companyStr}${serviceStr}. Your request has been securely recorded into our client relationship system.</p>
      
      <div class="lead-box">
        <p><strong>Next Steps:</strong></p>
        <p>1. Our team will review your project requirements.</p>
        <p>2. We will schedule a brief discovery call to discuss scope and timelines.</p>
        <p>3. We will prepare a personalized proposal tailored to your goals.</p>
      </div>

      <p>If you have any immediate questions or documents to share, simply reply to this email or contact us at <strong>${escapeHtml(
        adminEmail || 'kezianaicker24@gmail.com'
      )}</strong>.</p>

      <p style="margin-top: 28px;">Best regards,<br><strong>Kezia Naicker & Team</strong><br><span style="color: #64748b; font-size: 13px;">Client Relations & Growth</span></p>
    </div>
    <div class="footer">
      <p>This automated welcome message was sent via your connected Google Workspace CRM.</p>
      <p>&copy; ${new Date().getFullYear()} Kezia Naicker. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendWelcomeEmailViaGmail(
  accessToken: string,
  params: WelcomeEmailParams
): Promise<{ messageId: string; threadId: string }> {
  const subject =
    params.customSubject ||
    `Welcome to our Client Portal, ${params.clientName}!`;
  const htmlBody = params.customBody || generateWelcomeHtml(params);

  // Construct RFC 2822 email format
  const rfc2822Message = [
    `To: ${params.toEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
  ].join('\r\n');

  const encodedRaw = encodeBase64Url(rfc2822Message);

  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedRaw,
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to send email via Gmail: ${errorData.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  return {
    messageId: data.id,
    threadId: data.threadId,
  };
}
