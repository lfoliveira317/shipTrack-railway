import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from 'react-bootstrap';
import { toast } from 'sonner';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

export function TestEmail() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; email: string; message: string } | null>(null);

  const sendTestMutation = trpc.testEmail.sendTestEmail.useMutation({
    onSuccess: (data) => {
      setResult(data);
      if (data.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Failed to send test email');
      }
      setSending(false);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
      setSending(false);
    },
  });

  const handleSendTest = () => {
    setSending(true);
    setResult(null);
    sendTestMutation.mutate();
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <Mail size={48} className="text-primary mb-3" />
                <h2 className="h4 mb-2">Email Deliverability Test</h2>
                <p className="text-muted">
                  Send a test email to verify Resend API integration
                </p>
              </div>

              <div className="d-grid gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSendTest}
                  disabled={sending}
                  style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}
                >
                  {sending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Sending Test Email...
                    </>
                  ) : (
                    <>
                      <Mail size={20} className="me-2" />
                      Send Test Email
                    </>
                  )}
                </Button>

                {result && (
                  <div
                    className={`alert ${result.success ? 'alert-success' : 'alert-danger'} mb-0`}
                    role="alert"
                  >
                    <div className="d-flex align-items-start">
                      {result.success ? (
                        <CheckCircle size={24} className="me-2 flex-shrink-0" />
                      ) : (
                        <XCircle size={24} className="me-2 flex-shrink-0" />
                      )}
                      <div>
                        <strong>{result.success ? 'Success!' : 'Failed'}</strong>
                        <p className="mb-1 mt-1">{result.message}</p>
                        <small>
                          <strong>Email:</strong> {result.email}
                        </small>
                        {result.success && (
                          <p className="mb-0 mt-2">
                            <small>
                              💡 Check your inbox (and spam folder) for the test email.
                            </small>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-4" />

              <div className="small text-muted">
                <h6 className="fw-semibold mb-2">What this test verifies:</h6>
                <ul className="mb-0">
                  <li>Resend API configuration</li>
                  <li>Email template rendering</li>
                  <li>SMTP connectivity</li>
                  <li>Email deliverability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
