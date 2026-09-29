import { GoogleFormDetails } from '../types';

export async function createCRMForm(
  accessToken: string,
  title: string = 'Client Intake Form - CRM'
): Promise<GoogleFormDetails> {
  // 1. Create the initial empty form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: title,
      },
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      `Failed to create Google Form: ${errorData.error?.message || createRes.statusText}`
    );
  }

  const initialForm = await createRes.json();
  const formId = initialForm.formId;

  // 2. Batch update to add standard CRM intake questions
  const updateRequests = [
    {
      createItem: {
        item: {
          title: 'Full Name',
          description: 'Please enter your first and last name',
          questionItem: {
            question: {
              required: true,
              textQuestion: {
                paragraph: false,
              },
            },
          },
        },
        location: {
          index: 0,
        },
      },
    },
    {
      createItem: {
        item: {
          title: 'Email Address',
          description: 'Where should we send your welcome packet & correspondence?',
          questionItem: {
            question: {
              required: true,
              textQuestion: {
                paragraph: false,
              },
            },
          },
        },
        location: {
          index: 1,
        },
      },
    },
    {
      createItem: {
        item: {
          title: 'Company / Organization',
          description: 'Company or brand name',
          questionItem: {
            question: {
              required: false,
              textQuestion: {
                paragraph: false,
              },
            },
          },
        },
        location: {
          index: 2,
        },
      },
    },
    {
      createItem: {
        item: {
          title: 'Phone Number',
          description: 'Direct contact number',
          questionItem: {
            question: {
              required: false,
              textQuestion: {
                paragraph: false,
              },
            },
          },
        },
        location: {
          index: 3,
        },
      },
    },
    {
      createItem: {
        item: {
          title: 'Service of Interest',
          description: 'What type of service or solution are you looking for?',
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: [
                  { value: 'Consulting & Strategy' },
                  { value: 'Web & App Development' },
                  { value: 'Design & Branding' },
                  { value: 'Marketing & Growth' },
                  { value: 'Ongoing Support & Maintenance' },
                  { value: 'General Inquiry' },
                ],
              },
            },
          },
        },
        location: {
          index: 4,
        },
      },
    },
    {
      createItem: {
        item: {
          title: 'Estimated Budget',
          description: 'Approximate project investment range',
          questionItem: {
            question: {
              required: false,
              choiceQuestion: {
                type: 'RADIO',
                options: [
                  { value: '< $1,000' },
                  { value: '$1,000 - $5,000' },
                  { value: '$5,000 - $15,000' },
                  { value: '$15,000+' },
                  { value: 'Flexible / Undecided' },
                ],
              },
            },
          },
        },
        location: {
          index: 5,
        },
      },
    },
    {
      createItem: {
        item: {
          title: 'Project Details & Goals',
          description: 'Tell us a bit about your goals, timeline, and requirements',
          questionItem: {
            question: {
              required: false,
              textQuestion: {
                paragraph: true,
              },
            },
          },
        },
        location: {
          index: 6,
        },
      },
    },
  ];

  const batchRes = await fetch(
    `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: updateRequests,
        includeFormInResponse: true,
      }),
    }
  );

  if (!batchRes.ok) {
    console.warn('Form batchUpdate warning:', await batchRes.text());
  }

  // 3. Fetch full form details with updated items and responderUri
  return await getFormDetails(accessToken, formId);
}

export async function getFormDetails(
  accessToken: string,
  formId: string
): Promise<GoogleFormDetails> {
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch Google Form: ${errorData.error?.message || res.statusText}`
    );
  }

  const data = await res.json();

  return {
    formId: data.formId,
    title: data.info?.title || 'Client Intake Form',
    description: data.info?.description || '',
    responderUri:
      data.responderUri ||
      `https://docs.google.com/forms/d/e/${data.formId}/viewform`,
    editUri: `https://docs.google.com/forms/d/${data.formId}/edit`,
    items: data.items || [],
  };
}

export async function getFormResponses(
  accessToken: string,
  formId: string
): Promise<any[]> {
  const res = await fetch(
    `https://forms.googleapis.com/v1/forms/${formId}/responses`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch Form responses: ${errorData.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  return data.responses || [];
}
