import { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { trpc } from "../lib/trpc";

interface ApiConfigModalProps {
  show: boolean;
  onHide: () => void;
}

interface ApiCredentials {
  url: string;
  port: string;
  token: string;
  user: string;
  password: string;
}

export function ApiConfigModal({ show, onHide }: ApiConfigModalProps) {
  const [mode, setMode] = useState<"single" | "per-carrier">("single");
  const [singleApi, setSingleApi] = useState<ApiCredentials>({
    url: "",
    port: "",
    token: "",
    user: "",
    password: "",
  });
  const [selectedCarrier, setSelectedCarrier] = useState<string>("");
  const [carrierApis, setCarrierApis] = useState<Record<string, ApiCredentials>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch current configuration
  const { data: config } = trpc.apiConfig.getConfig.useQuery(undefined, {
    enabled: show,
  });

  // Fetch available carriers
  const { data: carriers = [] } = trpc.apiConfig.getCarriers.useQuery();

  // Save configuration mutation
  const saveConfigMutation = trpc.apiConfig.saveConfig.useMutation({
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onHide();
      }, 2000);
    },
  });

  // Load configuration when modal opens
  useEffect(() => {
    if (config) {
      setMode(config.mode);
      if (config.singleApi) {
        setSingleApi({
          url: config.singleApi.url || "",
          port: config.singleApi.port || "",
          token: config.singleApi.token || "",
          user: config.singleApi.user || "",
          password: config.singleApi.password || "",
        });
      }
      if (config.carrierApis) {
        const normalizedCarrierApis: Record<string, ApiCredentials> = {};
        Object.entries(config.carrierApis).forEach(([key, value]) => {
          normalizedCarrierApis[key] = {
            url: value.url || "",
            port: value.port || "",
            token: value.token || "",
            user: value.user || "",
            password: value.password || "",
          };
        });
        setCarrierApis(normalizedCarrierApis);
      }
    }
  }, [config]);

  const handleSingleApiChange = (field: keyof ApiCredentials, value: string) => {
    setSingleApi((prev) => ({ ...prev, [field]: value }));
  };

  const handleCarrierApiChange = (field: keyof ApiCredentials, value: string) => {
    if (!selectedCarrier) return;
    
    setCarrierApis((prev) => ({
      ...prev,
      [selectedCarrier]: {
        ...(prev[selectedCarrier] || {
          url: "",
          port: "",
          token: "",
          user: "",
          password: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    const configToSave = {
      mode,
      singleApi: mode === "single" ? singleApi : undefined,
      carrierApis: mode === "per-carrier" ? carrierApis : undefined,
    };

    saveConfigMutation.mutate(configToSave);
  };

  const currentCarrierApi = selectedCarrier
    ? carrierApis[selectedCarrier] || {
        url: "",
        port: "",
        token: "",
        user: "",
        password: "",
      }
    : null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>API Configuration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {saveSuccess && (
          <Alert variant="success">Configuration saved successfully!</Alert>
        )}

        <Form>
          {/* Mode Selection */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">API Configuration Mode</Form.Label>
            <Form.Check
              type="radio"
              id="mode-single"
              label="Same API for all shipments"
              checked={mode === "single"}
              onChange={() => setMode("single")}
              className="mb-2"
            />
            <Form.Check
              type="radio"
              id="mode-per-carrier"
              label="API by container company"
              checked={mode === "per-carrier"}
              onChange={() => setMode("per-carrier")}
            />
          </Form.Group>

          {/* Single API Configuration */}
          {mode === "single" && (
            <div className="border rounded p-3 bg-light">
              <h6 className="fw-bold mb-3">Global API Configuration</h6>
              <Row className="g-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">API URL</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="https://api.example.com"
                      value={singleApi.url}
                      onChange={(e) => handleSingleApiChange("url", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Port</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="8080"
                      value={singleApi.port}
                      onChange={(e) => handleSingleApiChange("port", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Token</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="API Token"
                      value={singleApi.token}
                      onChange={(e) => handleSingleApiChange("token", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={singleApi.user}
                      onChange={(e) => handleSingleApiChange("user", e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-medium">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={singleApi.password}
                      onChange={(e) => handleSingleApiChange("password", e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}

          {/* Per-Carrier API Configuration */}
          {mode === "per-carrier" && (
            <div className="border rounded p-3 bg-light">
              <h6 className="fw-bold mb-3">Carrier-Specific API Configuration</h6>
              
              <Form.Group className="mb-3">
                <Form.Label className="small fw-medium">Select Carrier</Form.Label>
                <Form.Select
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                >
                  <option value="">-- Select a carrier --</option>
                  {carriers.map((carrier) => (
                    <option key={carrier.value} value={carrier.value}>
                      {carrier.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {selectedCarrier && currentCarrierApi && (
                <Row className="g-3 mt-2">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label className="small fw-medium">API URL</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="https://api.example.com"
                        value={currentCarrierApi.url}
                        onChange={(e) => handleCarrierApiChange("url", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-medium">Port</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="8080"
                        value={currentCarrierApi.port}
                        onChange={(e) => handleCarrierApiChange("port", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-medium">Token</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="API Token"
                        value={currentCarrierApi.token}
                        onChange={(e) => handleCarrierApiChange("token", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-medium">Username</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Username"
                        value={currentCarrierApi.user}
                        onChange={(e) => handleCarrierApiChange("user", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-medium">Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        value={currentCarrierApi.password}
                        onChange={(e) => handleCarrierApiChange("password", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {selectedCarrier && (
                <Alert variant="info" className="mt-3 mb-0 small">
                  <strong>Note:</strong> Configuration for {carriers.find(c => c.value === selectedCarrier)?.label} will be saved.
                  You can configure multiple carriers by selecting them one at a time.
                </Alert>
              )}
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saveConfigMutation.isPending}
          style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}
        >
          {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
