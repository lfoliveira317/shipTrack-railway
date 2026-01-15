import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge, Card, Row, Col } from 'react-bootstrap';
import { trpc } from '@/lib/trpc';
import { Ship, Package, FileText, Calendar, MapPin, RefreshCw } from 'lucide-react';

interface MaerskTrackingModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: number;
  containerNumber?: string;
  onUpdateShipment: (updates: any) => void;
}

export function MaerskTrackingModal({
  show,
  onHide,
  shipmentId,
  containerNumber: initialContainerNumber,
  onUpdateShipment,
}: MaerskTrackingModalProps) {
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
          pol: data.data.route?.pol,
          pod: data.data.route?.pod,
          atd: data.data.route?.atd,
          ata: data.data.route?.ata,
          carrier: data.data.carrier,
        });
      }
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
                <option value="timetogo">TimeToGo (Recommended)</option>
                <option value="maersk">Maersk API</option>
              </Form.Select>
              <Form.Text className="text-muted">
                TimeToGo supports multiple carriers with auto-detection
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

            <Card className="mb-3">
              <Card.Header>
                <strong>Container Information</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <Package size={16} className="me-2" />
                      <strong>Container:</strong> {trackingData.containerNumber}
                    </p>
                    <p>
                      <FileText size={16} className="me-2" />
                      <strong>Type:</strong> {trackingData.containerType}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Status:</strong>{' '}
                      <Badge bg="info">{trackingData.status}</Badge>
                    </p>
                    <p>
                      <strong>Journey ID:</strong> {trackingData.journeyId}
                    </p>
                  </Col>
                </Row>

                {Object.keys(trackingData.references).length > 0 && (
                  <div className="mt-3">
                    <strong>References:</strong>
                    <ul className="mb-0 mt-2">
                      {Object.entries(trackingData.references).map(([key, value]) => (
                        <li key={key}>
                          {key}: {value as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>

            {trackingData.legs && trackingData.legs.length > 0 && (
              <Card className="mb-3">
                <Card.Header>
                  <strong>Journey Legs</strong>
                </Card.Header>
                <Card.Body>
                  {trackingData.legs.map((leg: any, index: number) => (
                    <div key={index} className="mb-3 pb-3 border-bottom">
                      <h6>
                        Leg {leg.sequence} - {leg.mode}
                      </h6>
                      <Row>
                        <Col md={6}>
                          <p className="mb-1">
                            <MapPin size={14} className="me-1" />
                            <strong>From:</strong> {leg.from}
                          </p>
                          <p className="mb-1">
                            <MapPin size={14} className="me-1" />
                            <strong>To:</strong> {leg.to}
                          </p>
                        </Col>
                        <Col md={6}>
                          {leg.vesselName && (
                            <p className="mb-1">
                              <Ship size={14} className="me-1" />
                              <strong>Vessel:</strong> {leg.vesselName}
                            </p>
                          )}
                          {leg.voyageNumber && (
                            <p className="mb-1">
                              <strong>Voyage:</strong> {leg.voyageNumber}
                            </p>
                          )}
                        </Col>
                      </Row>
                      <Row className="mt-2">
                        <Col md={6}>
                          {leg.etd && (
                            <p className="mb-1">
                              <Calendar size={14} className="me-1" />
                              <strong>ETD:</strong>{' '}
                              {new Date(leg.etd).toLocaleString()}
                            </p>
                          )}
                          {leg.atd && (
                            <p className="mb-1">
                              <Calendar size={14} className="me-1" />
                              <strong>ATD:</strong>{' '}
                              {new Date(leg.atd).toLocaleString()}
                            </p>
                          )}
                        </Col>
                        <Col md={6}>
                          {leg.eta && (
                            <p className="mb-1">
                              <Calendar size={14} className="me-1" />
                              <strong>ETA:</strong>{' '}
                              {new Date(leg.eta).toLocaleString()}
                            </p>
                          )}
                          {leg.ata && (
                            <p className="mb-1">
                              <Calendar size={14} className="me-1" />
                              <strong>ATA:</strong>{' '}
                              {new Date(leg.ata).toLocaleString()}
                            </p>
                          )}
                        </Col>
                      </Row>
                    </div>
                  ))}
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
              <Alert variant="info">
                <strong>Suggested Updates:</strong>
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
                  {suggestedUpdates.portOfLoading && (
                    <li>Port of Loading: {suggestedUpdates.portOfLoading}</li>
                  )}
                  {suggestedUpdates.portOfDischarge && (
                    <li>Port of Discharge: {suggestedUpdates.portOfDischarge}</li>
                  )}
                  {suggestedUpdates.eta && (
                    <li>ETA: {new Date(suggestedUpdates.eta).toLocaleDateString()}</li>
                  )}
                </ul>
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
