/**
 * FormBold Integration Service for SGC Group of Companies
 * Documentation: https://formbold.com
 * Form submissions are sent via HTTP POST to: https://formbold.com/s/<FORM_ID>
 */

// Default or fallback FormBold Form ID (can be configured via .env or in-app admin panel)
export const DEFAULT_FORMBOLD_FORM_ID = 'YOUR_FORMBOLD_ID';

/**
 * Retrieve the active FormBold Form ID.
 * Priority: LocalStorage (Admin configured) > Vite Environment Variable > Default Fallback
 */
export function getFormBoldFormId() {
  try {
    const customId = localStorage.getItem('sgc_formbold_form_id');
    if (customId && customId.trim()) {
      return customId.trim();
    }
  } catch (e) {
    console.warn('[FormBold] Could not read local storage for form ID', e);
  }

  const envId = import.meta.env.VITE_FORMBOLD_FORM_ID;
  if (envId && envId.trim()) {
    return envId.trim();
  }

  return DEFAULT_FORMBOLD_FORM_ID;
}

/**
 * Persist a custom FormBold Form ID into local storage.
 */
export function setFormBoldFormId(newId) {
  try {
    if (!newId || !newId.trim()) {
      localStorage.removeItem('sgc_formbold_form_id');
    } else {
      localStorage.setItem('sgc_formbold_form_id', newId.trim());
    }
    return true;
  } catch (e) {
    console.error('[FormBold] Failed to persist form ID', e);
    return false;
  }
}

/**
 * Dispatches lead data to FormBold serverless endpoint.
 *
 * @param {Object} leadData
 * @param {string} leadData.name - Client's full name
 * @param {string} leadData.phone - Client's mobile or WhatsApp number
 * @param {string} [leadData.email] - Client's email address
 * @param {string} [leadData.businessSection] - e.g. 'gold', 'catering', 'real_estate', 'general'
 * @param {string} [leadData.service] - Specific service requested
 * @param {string} [leadData.message] - Customer notes or specifications
 * @param {string} [leadData.source] - Component or modal source
 * @param {string} [leadData.location] - Preferred city / branch
 * @param {string} [leadData.goldWeight] - Estimated gold weight
 * @param {string} [leadData.lender] - Pledged lender name
 * @param {string} [leadData.loanAmount] - Outstanding loan balance
 * @returns {Promise<{success: boolean, responseData?: any, error?: any}>}
 */
export async function submitToFormBold(leadData) {
  const formId = getFormBoldFormId();
  const endpoint = `https://formbold.com/s/${formId}`;

  // Division readable labels
  const divisionLabels = {
    gold: 'SGC Gold Buying & Pledged Loan Clearance',
    catering: 'Salafiya Premium Catering Services',
    real_estate: 'Salafi Real Estate & Property Advisory',
    general: 'SGC Group Corporate Portal'
  };

  const readableDivision = divisionLabels[leadData.businessSection] || leadData.businessSection || 'SGC General Inquiry';

  // Format payload according to FormBold standards
  const payload = {
    name: leadData.name || 'Anonymous Visitor',
    phone: leadData.phone || 'Not provided',
    email: leadData.email && !leadData.email.includes('No email provided') ? leadData.email : 'lead@sgcgroup.co',
    division: readableDivision,
    service: leadData.service || readableDivision,
    source: leadData.source || 'Website Lead Form',
    message: leadData.message || 'No additional note provided',
    preferredLocation: leadData.location || leadData.city || 'Tricity / Srinagar',
    goldWeight: leadData.goldWeight || undefined,
    lenderName: leadData.lender || undefined,
    estimatedLoanDue: leadData.loanAmount || undefined,
    submittedAt: leadData.date || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    appOrigin: typeof window !== 'undefined' ? window.location.origin : 'SGC Portal'
  };

  // Remove undefined values to keep the payload clean
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  console.log(`[FormBold] Submitting lead payload to endpoint: https://formbold.com/s/${formId}`, payload);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      let json = {};
      try {
        json = await res.json();
      } catch (e) {
        // FormBold sometimes returns empty 200 or HTML
      }
      console.log('[FormBold] Lead successfully recorded at FormBold:', json);
      return { success: true, responseData: json };
    } else {
      console.warn(`[FormBold] Server returned status ${res.status}: ${res.statusText}`);
      return { 
        success: false, 
        error: `FormBold returned HTTP ${res.status}` 
      };
    }
  } catch (networkErr) {
    console.error('[FormBold] Network error submitting to FormBold:', networkErr);
    return { success: false, error: networkErr.message || 'Network error' };
  }
}

/**
 * Diagnostic helper to test FormBold endpoint from the Admin Dashboard
 */
export async function testFormBoldEndpoint(customId) {
  const targetId = customId || getFormBoldFormId();
  if (!targetId || targetId === 'YOUR_FORMBOLD_ID') {
    return {
      success: false,
      message: 'FormBold ID is not configured yet. Please enter your FormBold Form ID.'
    };
  }

  try {
    const res = await fetch(`https://formbold.com/s/${targetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: 'SGC Diagnostic Ping',
        email: 'diagnostic@sgcgroup.co',
        phone: '+91 91863 76081',
        message: 'This is an automated connectivity test sent from SGC Admin Dashboard.',
        division: 'Diagnostic Test',
        source: 'Admin Dashboard Test Ping',
        submittedAt: new Date().toISOString()
      })
    });

    if (res.ok) {
      return {
        success: true,
        message: `Endpoint https://formbold.com/s/${targetId} responded with HTTP ${res.status} OK.`
      };
    } else {
      return {
        success: false,
        message: `Endpoint returned HTTP ${res.status} (${res.statusText}). Check if Form ID exists.`
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `Failed to connect to FormBold: ${err.message}`
    };
  }
}
