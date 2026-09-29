import { ClientLead, GoogleSheetDetails } from '../types';

export const CRM_HEADERS = [
  'Timestamp',
  'Client Name',
  'Email Address',
  'Company',
  'Phone Number',
  'Service of Interest',
  'Budget',
  'Notes',
  'Status',
  'Welcome Email Sent',
];

export async function createCRMSpreadsheet(
  accessToken: string,
  title: string = 'Client CRM Database'
): Promise<GoogleSheetDetails> {
  const sheetName = 'Clients';

  // 1. Create spreadsheet with custom sheet tab and frozen header row
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title,
      },
      sheets: [
        {
          properties: {
            title: sheetName,
            gridProperties: {
              frozenRowCount: 1,
              columnCount: 15,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      `Failed to create Google Spreadsheet: ${errorData.error?.message || createRes.statusText}`
    );
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl;

  // 2. Set the initial header row with formatted column titles
  const headerRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetName
    )}!A1:J1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [CRM_HEADERS],
      }),
    }
  );

  if (!headerRes.ok) {
    console.warn('Failed to write headers:', await headerRes.text());
  }

  // 3. Format header row (bold, background color)
  try {
    const sheetId = spreadsheet.sheets?.[0]?.properties?.sheetId || 0;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: CRM_HEADERS.length,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.12,
                      green: 0.25,
                      blue: 0.44,
                    },
                    textFormat: {
                      bold: true,
                      foregroundColor: {
                        red: 1.0,
                        green: 1.0,
                        blue: 1.0,
                      },
                      fontSize: 11,
                    },
                    horizontalAlignment: 'LEFT',
                  },
                },
                fields:
                  'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: sheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: CRM_HEADERS.length,
                },
              },
            },
          ],
        }),
      }
    );
  } catch (err) {
    console.warn('Non-fatal formatting error:', err);
  }

  return {
    spreadsheetId,
    spreadsheetUrl:
      spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title,
    sheetName,
    rowCount: 1,
  };
}

export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<GoogleSheetDetails> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,spreadsheetUrl,sheets.properties(title,sheetId,gridProperties)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch spreadsheet details: ${errorData.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  const firstSheetName = data.sheets?.[0]?.properties?.title || 'Clients';

  return {
    spreadsheetId,
    spreadsheetUrl:
      data.spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title: data.properties?.title || 'CRM Spreadsheet',
    sheetName: firstSheetName,
    rowCount: data.sheets?.[0]?.properties?.gridProperties?.rowCount || 1,
  };
}

export async function getClientLeadsFromSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string = 'Clients'
): Promise<ClientLead[]> {
  const range = `${encodeURIComponent(sheetName)}!A1:J1000`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to read spreadsheet values: ${errorData.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  if (rows.length <= 1) {
    return [];
  }

  // First row is headers, remaining rows are clients
  const leads: ClientLead[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row.some((cell) => cell.trim() !== '')) {
      continue;
    }

    leads.push({
      id: `row-${i + 1}`,
      rowIndex: i + 1, // 1-based index in Sheet
      timestamp: row[0] || new Date().toISOString(),
      name: row[1] || 'Unknown',
      email: row[2] || '',
      company: row[3] || '',
      phone: row[4] || '',
      service: row[5] || 'General Inquiry',
      budget: row[6] || '',
      notes: row[7] || '',
      status: (row[8] as any) || 'New Lead',
      welcomeSent: row[9] || 'No',
    });
  }

  return leads;
}

export async function appendClientToSheet(
  accessToken: string,
  spreadsheetId: string,
  lead: Omit<ClientLead, 'id' | 'rowIndex'>,
  sheetName: string = 'Clients'
): Promise<{ updatedRange: string }> {
  const values = [
    [
      lead.timestamp || new Date().toLocaleString(),
      lead.name,
      lead.email,
      lead.company,
      lead.phone,
      lead.service,
      lead.budget,
      lead.notes,
      lead.status || 'New Lead',
      lead.welcomeSent || 'Yes',
    ],
  ];

  const range = `${encodeURIComponent(sheetName)}!A:J:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to append row to Google Sheet: ${errorData.error?.message || res.statusText}`
    );
  }

  const result = await res.json();
  return { updatedRange: result.updates?.updatedRange || '' };
}

export async function updateClientInSheet(
  accessToken: string,
  spreadsheetId: string,
  rowIndex: number,
  updates: {
    status?: string;
    welcomeSent?: string;
    notes?: string;
  },
  sheetName: string = 'Clients'
): Promise<void> {
  // If status is provided, update column I (column 9)
  if (updates.status !== undefined) {
    const range = `${encodeURIComponent(sheetName)}!I${rowIndex}?valueInputOption=USER_ENTERED`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [[updates.status]] }),
      }
    );
  }

  // If welcomeSent is provided, update column J (column 10)
  if (updates.welcomeSent !== undefined) {
    const range = `${encodeURIComponent(sheetName)}!J${rowIndex}?valueInputOption=USER_ENTERED`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [[updates.welcomeSent]] }),
      }
    );
  }

  // If notes updated, update column H (column 8)
  if (updates.notes !== undefined) {
    const range = `${encodeURIComponent(sheetName)}!H${rowIndex}?valueInputOption=USER_ENTERED`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [[updates.notes]] }),
      }
    );
  }
}
