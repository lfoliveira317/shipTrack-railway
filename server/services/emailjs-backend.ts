import emailjs from '@emailjs/nodejs';

// EmailJS configuration
const EMAILJS_PUBLIC_KEY = 'TuMe7vcBtd1Fr_bqU';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '';
const EMAILJS_SERVICE_ID = 'service_e5jsjkk';
const EMAILJS_TEMPLATE_ID = 'template_z8h9z7w';

export interface EmailJSParams {
  to_email: string;
  to_name: string;
  from_name: string;
  subject: string;
  message: string;
  message_html?: string; // HTML content for rich emails
}

/**
 * Send email via EmailJS from backend
 * @param params Email parameters matching the EmailJS template
 * @returns Promise<boolean> true if sent successfully, false otherwise
 */
export async function sendEmailViaEmailJS(params: EmailJSParams): Promise<boolean> {
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: params.to_email,
        to_name: params.to_name,
        from_name: params.from_name,
        subject: params.subject,
        message: params.message,
        // Send HTML content via message_html parameter
        // The EmailJS template must use {{{message_html}}} (triple braces) to render HTML
        message_html: params.message_html || params.message,
      },
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    );
    
    console.log('[EmailJS Backend] Email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('[EmailJS Backend] Failed to send email:', error);
    return false;
  }
}

/**
 * Convert HTML email content to plain text for EmailJS
 * Used as fallback text version of the email
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
