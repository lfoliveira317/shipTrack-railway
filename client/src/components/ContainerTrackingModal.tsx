import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge, Card, Row, Col } from 'react-bootstrap';
import { trpc } from '@/lib/trpc';
import { Ship, Package, FileText, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

interface ContainerTrackingModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: number;
  containerNumber?: string;
  onUpdateShipment: (updates: any) => void;
}

export function ContainerTrackingModal({
  show,
  onHide,
  shipmentId,
  containerNumber: initialContainerNumber,
  onUpdateShipment,
}: ContainerTrackingModalProps) {
  const [trackingType, setTrackingType] = useState<'container' | 'bol' | 'booking'>('container');
  const [trackingValue, setTrackingValue] = useState(initialContainerNumber || '');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [suggestedUpdates, setSuggestedUpdates] = useState<any>(null);
  const [autoTrackingEnabled, setAutoTrackingEnabled] = useState(false);

  // Get shipment data to check auto-tracking status
  const { data: shipments } = trpc.shipments.list.useQuery();
  const currentShipment = shipments?.find((s: any) => s.id === shipmentId);

  useEffect(() => {
    if (currentShipment) {
      setAutoTrackingEnabled(currentShipment.autoTrackingEnabled === 1);
    }
  }, [currentShipment]);

  const toggleAutoTrackingMutation = trpc.maerskTracking.toggleAutoTracking.useMutation({
    onSuccess: () => {
      // Refetch shipments to update the UI
      window.location.reload();
    },
  });

  const [trackingProvider, setTrackingProvider] = useState<'maersk' | 'timetogo'>('timetogo');

  const trackMutation = trpc.maerskTracking.trackAndUpdateShipment.useMutation({
    onSuccess: (data) => {
      setTrackingData(data.trackingData);
      setSuggestedUpdates(data.suggestedUpdates);
    },
  });

  const trackTimeToGoMutation = trpc.maerskTracking.trackWithTimeToGo.useMutation({
    onSuccess: (data) => {
      setTrackingData(data.data);
      // Map TimeToGo response to suggested updates format
      if (data.data) {
        setSuggestedUpdates({
          status: data.data.status,
          eta: data.data.eta,
          portOfLoading: data.data.portOfLoading,
          portOfDischarge: data.data.portOfDischarge,
          atd: data.data.atd,
          ata: data.data.ata,
          carrier: data.data.carrier,
          vesselName: data.data.vesselName,
          voyageNumber: data.data.voyageNumber,
        });
      }
    },
  });

  const applyUpdatesMutation = trpc.maerskTracking.applyTrackingUpdates.useMutation({
    onSuccess: () => {
      // Build list of updated fields
      const updatedFields: string[] = [];
      if (suggestedUpdates) {
        if (suggestedUpdates.status) updatedFields.push(`Status: ${suggestedUpdates.status}`);
        if (suggestedUpdates.carrier) updatedFields.push(`Carrier: ${suggestedUpdates.carrier}`);
        if (suggestedUpdates.portOfLoading) updatedFields.push(`POL: ${suggestedUpdates.portOfLoading}`);
        if (suggestedUpdates.portOfDischarge) updatedFields.push(`POD: ${suggestedUpdates.portOfDischarge}`);
        if (suggestedUpdates.atd) updatedFields.push(`ATD: ${new Date(suggestedUpdates.atd).toLocaleDateString()}`);
        if (suggestedUpdates.eta) updatedFields.push(`ETA: ${new Date(suggestedUpdates.eta).toLocaleDateString()}`);
        if (suggestedUpdates.ata) updatedFields.push(`ATA: ${new Date(suggestedUpdates.ata).toLocaleDateString()}`);
        if (suggestedUpdates.vesselName) updatedFields.push(`Vessel: ${suggestedUpdates.vesselName}`);
        if (suggestedUpdates.voyageNumber) updatedFields.push(`Voyage: ${suggestedUpdates.voyageNumber}`);
      }
      
      // Show success toast with updated fields
      toast.success(
        <div>
          <strong>Shipment Updated Successfully!</strong>
          <div className="mt-2">
            <small>Updated fields:</small>
            <ul className="mb-0 mt-1" style={{ paddingLeft: '1.2rem' }}>
              {updatedFields.map((field, index) => (
                <li key={index} style={{ fontSize: '0.85rem' }}>{field}</li>
              ))}
            </ul>
          </div>
        </div>,
        {
          autoClose: 7000,
        }
      );
      
      // Refetch shipments and close modal
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      toast.error(`Failed to update shipment: ${error.message}`);
    },
  });

  const handleTrack = () => {
    if (!trackingValue.trim()) {
      return;
    }

    if (trackingProvider === 'timetogo') {
      // Use TimeToGo API
      trackTimeToGoMutation.mutate({
        containerNumber: trackingValue.trim(),
        company: 'AUTO',
      });
    } else {
      // Use Maersk API
      trackMutation.mutate({
        shipmentId,
        trackingType,
        trackingValue: trackingValue.trim(),
        scac: 'MAEU',
      });
    }
  };

  const handleApplyUpdates = () => {
    if (suggestedUpdates) {
      onUpdateShipment(suggestedUpdates);
      onHide();
    }
  };

  const handleClose = () => {
    setTrackingData(null);
    setSuggestedUpdates(null);
    setTrackingValue(initialContainerNumber || '');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <Ship size={20} className="me-2" />
          Track Container
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!trackingData ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Tracking Provider</Form.Label>
              <Form.Select
                value={trackingProvider}
                onChange={(e) => setTrackingProvider(e.target.value as any)}
              >
                <option value="timetogo">Multi-Carrier Tracking (Recommended)</option>
                <option value="maersk">Maersk Direct API</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Multi-carrier tracking supports automatic carrier detection for all major shipping lines
              </Form.Text>
            </Form.Group>

            {trackingProvider === 'maersk' && (
              <Form.Group className="mb-3">
                <Form.Label>Tracking Type</Form.Label>
                <Form.Select
                  value={trackingType}
                  onChange={(e) => setTrackingType(e.target.value as any)}
                >
                  <option value="container">Container Number</option>
                  <option value="bol">Bill of Lading</option>
                  <option value="booking">Booking Number</option>
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                {trackingProvider === 'timetogo'
                  ? 'Container Number'
                  : trackingType === 'container'
                  ? 'Container Number'
                  : trackingType === 'bol'
                  ? 'Bill of Lading Number'
                  : 'Booking Number'}
              </Form.Label>
              <Form.Control
                type="text"
                value={trackingValue}
                onChange={(e) => setTrackingValue(e.target.value)}
                placeholder={
                  trackingProvider === 'timetogo'
                    ? 'e.g., MSDU8368827 (4 letters + 7 digits)'
                    : trackingType === 'container'
                    ? 'e.g., MAEU1234567'
                    : trackingType === 'bol'
                    ? 'e.g., MAEU123456789'
                    : 'e.g., BK123456789'
                }
              />
            </Form.Group>

            {(trackMutation.error || trackTimeToGoMutation.error) && (
              <Alert variant="danger">
                {trackMutation.error?.message || trackTimeToGoMutation.error?.message}
              </Alert>
            )}
          </>
        ) : (
          <>
            <Alert variant="success">
              <strong>Tracking Data Retrieved Successfully!</strong>
            </Alert>

            {/* Container & Shipment Overview */}
            <Card className="mb-3">
              <Card.Header>
                <strong>Container & Shipment Information</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p className="mb-2">
                      <Package size={16} className="me-2" />
                      <strong>Container:</strong> {trackingData.containerNumber}
                    </p>
                    <p className="mb-2">
                      <FileText size={16} className="me-2" />
                      <strong>Type:</strong> {trackingData.containerType || 'N/A'}
                    </p>
                    <p className="mb-2">
                      <Ship size={16} className="me-2" />
                      <strong>Carrier:</strong> {trackingData.carrier || 'N/A'}
                    </p>
                    {trackingData.carrierScac && (
                      <p className="mb-2">
                        <strong>SCAC:</strong> {trackingData.carrierScac}
                      </p>
                    )}
                  </Col>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Status:</strong>{' '}
                      <Badge bg={trackingData.status === 'DELIVERED' ? 'success' : trackingData.status === 'IN_TRANSIT' ? 'info' : 'warning'}>
                        {trackingData.status || 'N/A'}
                      </Badge>
                    </p>
                    {trackingData.vesselName && (
                      <p className="mb-2">
                        <strong>Vessel:</strong> {trackingData.vesselName}
                      </p>
                    )}
                    {trackingData.voyageNumber && (
                      <p className="mb-2">
                        <strong>Voyage:</strong> {trackingData.voyageNumber}
                      </p>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Ports & Dates */}
            <Card className="mb-3">
              <Card.Header>
                <strong>Ports & Dates</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <h6 className="text-primary mb-2">
                        <MapPin size={16} className="me-1" />
                        Port of Loading (POL)
                      </h6>
                      <p className="mb-1">
                        <strong>Port:</strong> {trackingData.portOfLoading || 'N/A'}
                      </p>
                      {trackingData.portOfLoadingCode && (
                        <p className="mb-1 text-muted small">
                          Code: {trackingData.portOfLoadingCode}
                        </p>
                      )}
                      {trackingData.atd && (
                        <p className="mb-1">
                          <strong>ATD:</strong> {new Date(trackingData.atd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <h6 className="text-success mb-2">
                        <MapPin size={16} className="me-1" />
                        Port of Discharge (POD)
                      </h6>
                      <p className="mb-1">
                        <strong>Port:</strong> {trackingData.portOfDischarge || 'N/A'}
                      </p>
                      {trackingData.portOfDischargeCode && (
                        <p className="mb-1 text-muted small">
                          Code: {trackingData.portOfDischargeCode}
                        </p>
                      )}
                      {trackingData.eta && (
                        <p className="mb-1">
                          <strong>ETA:</strong> {new Date(trackingData.eta).toLocaleDateString()}
                        </p>
                      )}
                      {trackingData.ata && (
                        <p className="mb-1">
                          <strong>ATA:</strong> {new Date(trackingData.ata).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Container Events Timeline */}
            {trackingData.events && trackingData.events.length > 0 && (
              <Card className="mb-3">
                <Card.Header>
                  <strong>Container Events Timeline</strong>
                </Card.Header>
                <Card.Body>
                  <div className="timeline">
                    {trackingData.events.map((event: any, index: number) => (
                      <div key={index} className="mb-3 pb-3 border-bottom">
                        <Row>
                          <Col md={8}>
                            <div className="d-flex align-items-start">
                              <div className="me-3">
                                {event.actual ? (
                                  <Badge bg="success" className="px-2 py-1">Actual</Badge>
                                ) : (
                                  <Badge bg="secondary" className="px-2 py-1">Estimated</Badge>
                                )}
                              </div>
                              <div>
                                <h6 className="mb-1">{event.status}</h6>
                                <p className="mb-1 text-muted small">
                                  <MapPin size={14} className="me-1" />
                                  {event.location}
                                  {event.locationCode && ` (${event.locationCode})`}
                                </p>
                                {event.terminal && (
                                  <p className="mb-1 text-muted small">
                                    Terminal: {event.terminal}
                                  </p>
                                )}
                                {event.vessel && (
                                  <p className="mb-1 text-muted small">
                                    <Ship size={14} className="me-1" />
                                    {event.vessel}
                                    {event.voyage && ` - Voyage: ${event.voyage}`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Col>
                          <Col md={4} className="text-end">
                            <p className="mb-0">
                              <Calendar size={14} className="me-1" />
                              <strong>{new Date(event.date).toLocaleDateString()}</strong>
                            </p>
                            <p className="mb-0 text-muted small">
                              {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            {event.statusCode && (
                              <Badge bg="light" text="dark" className="mt-1">
                                {event.statusCode}
                              </Badge>
                            )}
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Auto-tracking toggle */}
            <Card className="mb-3">
              <Card.Body>
                <Form.Check
                  type="switch"
                  id="auto-tracking-switch"
                  label={
                    <span>
                      <RefreshCw size={16} className="me-2" />
                      Enable automatic tracking for this shipment
                    </span>
                  }
                  checked={autoTrackingEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setAutoTrackingEnabled(enabled);
                    toggleAutoTrackingMutation.mutate({
                      shipmentId,
                      enabled,
                    });
                  }}
                  disabled={toggleAutoTrackingMutation.isPending}
                />
                <Form.Text className="text-muted">
                  When enabled, this shipment will be automatically tracked every 30 minutes
                </Form.Text>
              </Card.Body>
            </Card>

            {suggestedUpdates && (
              <Alert variant="success">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>Ready to Update Shipment:</strong>
                    <ul className="mb-0 mt-2">
                      {suggestedUpdates.status && (
                        <li>Status: {suggestedUpdates.status}</li>
                      )}
                      {suggestedUpdates.carrier && (
                        <li>Carrier: {suggestedUpdates.carrier}</li>
                      )}
                      {suggestedUpdates.vesselName && (
                        <li>Vessel: {suggestedUpdates.vesselName}</li>
                      )}
                      {suggestedUpdates.voyageNumber && (
                        <li>Voyage: {suggestedUpdates.voyageNumber}</li>
                      )}
                      {suggestedUpdates.portOfLoading && (
                        <li>Port of Loading: {suggestedUpdates.portOfLoading}</li>
                      )}
                      {suggestedUpdates.portOfDischarge && (
                        <li>Port of Discharge: {suggestedUpdates.portOfDischarge}</li>
                      )}
                      {suggestedUpdates.atd && (
                        <li>ATD: {new Date(suggestedUpdates.atd).toLocaleDateString()}</li>
                      )}
                      {suggestedUpdates.eta && (
                        <li>ETA: {new Date(suggestedUpdates.eta).toLocaleDateString()}</li>
                      )}
                      {suggestedUpdates.ata && (
                        <li>ATA: {new Date(suggestedUpdates.ata).toLocaleDateString()}</li>
                      )}
                    </ul>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      applyUpdatesMutation.mutate({
                        shipmentId,
                        updates: suggestedUpdates,
                      });
                    }}
                    disabled={applyUpdatesMutation.isPending}
                  >
                    {applyUpdatesMutation.isPending ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Applying...
                      </>
                    ) : (
                      'Apply Updates'
                    )}
                  </Button>
                </div>
              </Alert>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!trackingData ? (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleTrack}
              disabled={(trackMutation.isPending || trackTimeToGoMutation.isPending) || !trackingValue.trim()}
            >
              {(trackMutation.isPending || trackTimeToGoMutation.isPending) ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Tracking...
                </>
              ) : (
                'Track Container'
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleApplyUpdates}>
              Apply Suggested Updates
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
