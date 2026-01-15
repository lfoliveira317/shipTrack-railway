import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'react-toastify';

export function NotificationSettings() {
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: preferences, isLoading: prefsLoading } = trpc.userPreferences.getNotificationPreferences.useQuery();
  const updatePreferences = trpc.userPreferences.updateNotificationPreferences.useMutation();

  const [formData, setFormData] = useState({
    emailNotifications: true,
    emailFrequency: 'immediate' as 'immediate' | 'hourly' | 'daily' | 'weekly',
    notifyContainerUpdates: true,
    notifyDischargeDateChanges: true,
    notifyMissingDocuments: true,
    notifyOnStatusChange: true,
    notifyOnDelay: true,
    notifyOnArrival: true,
    quietHoursStart: '',
    quietHoursEnd: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        emailNotifications: preferences.emailNotifications === 1,
        emailFrequency: (preferences.emailFrequency || 'immediate') as any,
        notifyContainerUpdates: preferences.notifyContainerUpdates === 1,
        notifyDischargeDateChanges: preferences.notifyDischargeDateChanges === 1,
        notifyMissingDocuments: preferences.notifyMissingDocuments === 1,
        notifyOnStatusChange: preferences.notifyOnStatusChange === 1,
        notifyOnDelay: preferences.notifyOnDelay === 1,
        notifyOnArrival: preferences.notifyOnArrival === 1,
        quietHoursStart: preferences.quietHoursStart || '',
        quietHoursEnd: preferences.quietHoursEnd || '',
        timezone: preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updatePreferences.mutateAsync({
        emailNotifications: formData.emailNotifications ? 1 : 0,
        emailFrequency: formData.emailFrequency,
        notifyContainerUpdates: formData.notifyContainerUpdates ? 1 : 0,
        notifyDischargeDateChanges: formData.notifyDischargeDateChanges ? 1 : 0,
        notifyMissingDocuments: formData.notifyMissingDocuments ? 1 : 0,
        notifyOnStatusChange: formData.notifyOnStatusChange ? 1 : 0,
        notifyOnDelay: formData.notifyOnDelay ? 1 : 0,
        notifyOnArrival: formData.notifyOnArrival ? 1 : 0,
        quietHoursStart: formData.quietHoursStart || null,
        quietHoursEnd: formData.quietHoursEnd || null,
        timezone: formData.timezone,
      });

      toast.success('Notification settings saved successfully');
    } catch (error: any) {
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (userLoading || prefsLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow-1 d-flex flex-column p-2 p-md-3" style={{ minHeight: 0 }}>
      <div className="row flex-grow-1" style={{ minHeight: 0 }}>
        <div className="col-lg-8 mx-auto d-flex flex-column" style={{ minHeight: 0 }}>
          <div className="card shadow-sm d-flex flex-column" style={{ minHeight: 0, maxHeight: '100%' }}>
            <div className="card-header bg-primary text-white flex-shrink-0">
              <h4 className="mb-0">
                <i className="bi bi-bell me-2"></i>
                Notification Settings
              </h4>
            </div>
            <div className="card-body overflow-auto" style={{ minHeight: 0 }}>
              <form onSubmit={handleSubmit}>
                {/* Email Notifications Toggle */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3">Email Notifications</h5>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="emailNotifications">
                      <strong>Enable Email Notifications</strong>
                      <div className="text-muted small">Receive email alerts for shipment updates</div>
                    </label>
                  </div>
                </div>

                {/* Email Frequency */}
                {formData.emailNotifications && (
                  <div className="mb-4">
                    <label htmlFor="emailFrequency" className="form-label">
                      <strong>Email Frequency</strong>
                    </label>
                    <select
                      id="emailFrequency"
                      className="form-select"
                      value={formData.emailFrequency}
                      onChange={(e) => setFormData({ ...formData, emailFrequency: e.target.value as any })}
                    >
                      <option value="immediate">Immediate - Send emails as events occur</option>
                      <option value="hourly">Hourly Digest - Summary every hour</option>
                      <option value="daily">Daily Digest - Summary once per day (9 AM)</option>
                      <option value="weekly">Weekly Digest - Summary once per week (Monday 9 AM)</option>
                    </select>
                    <div className="form-text">
                      Choose how often you want to receive email notifications
                    </div>
                  </div>
                )}

                {/* Notification Types */}
                <div className="mb-4">
                  <h5 className="border-bottom pb-2 mb-3">Notification Types</h5>
                  
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifyContainerUpdates"
                      checked={formData.notifyContainerUpdates}
                      onChange={(e) => setFormData({ ...formData, notifyContainerUpdates: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="notifyContainerUpdates">
                      <strong>Container Updates</strong>
                      <div className="text-muted small">Tracking changes, status updates, location changes</div>
                    </label>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifyDischargeDateChanges"
                      checked={formData.notifyDischargeDateChanges}
                      onChange={(e) => setFormData({ ...formData, notifyDischargeDateChanges: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="notifyDischargeDateChanges">
                      <strong>Discharge Date Changes</strong>
                      <div className="text-muted small">ETA/ATA changes at port of discharge</div>
                    </label>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifyMissingDocuments"
                      checked={formData.notifyMissingDocuments}
                      onChange={(e) => setFormData({ ...formData, notifyMissingDocuments: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="notifyMissingDocuments">
                      <strong>Missing Documents</strong>
                      <div className="text-muted small">Alerts for containers with incomplete documentation</div>
                    </label>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifyOnStatusChange"
                      checked={formData.notifyOnStatusChange}
                      onChange={(e) => setFormData({ ...formData, notifyOnStatusChange: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="notifyOnStatusChange">
                      <strong>Status Changes</strong>
                      <div className="text-muted small">Shipment status updates</div>
                    </label>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifyOnDelay"
                      checked={formData.notifyOnDelay}
                      onChange={(e) => setFormData({ ...formData, notifyOnDelay: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="notifyOnDelay">
                      <strong>Delays</strong>
                      <div className="text-muted small">Shipment delays and ETA changes</div>
                    </label>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notifyOnArrival"
                      checked={formData.notifyOnArrival}
                      onChange={(e) => setFormData({ ...formData, notifyOnArrival: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="notifyOnArrival">
                      <strong>Arrivals</strong>
                      <div className="text-muted small">Container arrival notifications</div>
                    </label>
                  </div>
                </div>

                {/* Quiet Hours */}
                {formData.emailNotifications && (
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2 mb-3">Quiet Hours</h5>
                    <p className="text-muted small mb-3">
                      Set hours when you don't want to receive email notifications
                    </p>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="quietHoursStart" className="form-label">Start Time</label>
                        <input
                          type="time"
                          id="quietHoursStart"
                          className="form-control"
                          value={formData.quietHoursStart}
                          onChange={(e) => setFormData({ ...formData, quietHoursStart: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="quietHoursEnd" className="form-label">End Time</label>
                        <input
                          type="time"
                          id="quietHoursEnd"
                          className="form-control"
                          value={formData.quietHoursEnd}
                          onChange={(e) => setFormData({ ...formData, quietHoursEnd: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-text">
                      Example: Set 22:00 to 08:00 to avoid notifications during night hours
                    </div>
                  </div>
                )}

                {/* Timezone */}
                <div className="mb-4">
                  <label htmlFor="timezone" className="form-label">
                    <strong>Timezone</strong>
                  </label>
                  <input
                    type="text"
                    id="timezone"
                    className="form-control"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  />
                  <div className="form-text">
                    Your current timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </div>
                </div>

                {/* Save Button */}
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="card mt-4 border-info">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-info-circle text-info me-2"></i>
                About Notification Settings
              </h6>
              <ul className="mb-0 small">
                <li>Immediate emails are sent as events occur in real-time</li>
                <li>Digest emails combine multiple updates into a single summary</li>
                <li>Quiet hours prevent emails during specified times (based on your timezone)</li>
                <li>You can customize which types of notifications you want to receive</li>
                <li>In-app notifications are always enabled regardless of email settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
