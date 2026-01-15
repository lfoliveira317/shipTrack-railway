import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_PUBLIC_KEY = 'TuMe7vcBtd1Fr_bqU';
const EMAILJS_SERVICE_ID = 'service_e5jsjkk';
const EMAILJS_TEMPLATE_ID = 'template_z8h9z7w';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailParams {
  to_email: string;
  to_name: string;
  from_name: string;
  subject: string;
  message: string;
}

export async function sendEmailViaEmailJS(params: EmailParams): Promise<boolean> {
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
      }
    );
    
    console.log('[EmailJS] Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('[EmailJS] Failed to send email:', error);
    return false;
  }
}
