import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Tabs, Tab } from "react-bootstrap";
import { Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Shipment = {
  id: number;
  sellerCloudNumber: string | null;
  label: string | null;
  supplier: string | null;
  cro?: string | null;
  container: string;
  mawbNumber?: string | null;
  carrier: string;
  status: string;
  atd?: string | null;
  pol: string | null;
  pod?: string | null;
  eta: string;
  ata?: string | null;
  shipmentType?: "ocean" | "air" | string | null;
  bolNumber?: string | null;
  poNumber?: string | null;
};

interface AddShipmentModalProps {
  show: boolean;
  onHide: () => void;
  editingShipment?: Shipment | null;
}

const initialFormData = {
  sellerCloudNumber: "",
  label: "",
  supplier: "",
  cro: "",
  container: "",
  mawbNumber: "",
  carrier: "",
  status: "In transit",
  atd: "",
  pol: "",
  pod: "",
  eta: "",
  ata: "",
  bolNumber: "",
  poNumber: "",
};

export function AddShipmentModal({ show, onHide, editingShipment }: AddShipmentModalProps) {
  const [shipmentType] = useState<"ocean" | "air">("ocean"); // Always ocean, air removed
  const [inputMethod, setInputMethod] = useState<"container" | "bol">("container");
  const [bulkText, setBulkText] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [isAutoTracking, setIsAutoTracking] = useState(false);

  // Fetch dropdown values from reference data API
  const { data: suppliers } = trpc.referenceData.getSuppliers.useQuery();
  const { data: carriers } = trpc.referenceData.getCarriers.useQuery();
  const { data: statuses } = trpc.referenceData.getStatuses.useQuery();
  const { data: polPorts } = trpc.referenceData.getPorts.useQuery({ type: 'loading' });
  const { data: podPorts } = trpc.referenceData.getPorts.useQuery({ type: 'discharge' });

  // Auto-tracking mutation
  const autoTrackMutation = trpc.maerskTracking.trackWithTimeToGo.useMutation({
    onSuccess: (data) => {
      if (data?.data) {
        // Auto-populate fields from tracking data
        setFormData(prev => ({
          ...prev,
          carrier: data.data?.carrier || prev.carrier,
          status: data.data?.status || prev.status,
          pol: data.data?.portOfLoading || prev.pol,
          pod: data.data?.portOfDischarge || prev.pod,
          atd: data.data?.atd ? new Date(data.data.atd).toISOString().split('T')[0] : prev.atd,
          eta: data.data?.eta ? new Date(data.data.eta).toISOString().split('T')[0] : prev.eta,
          ata: data.data?.ata ? new Date(data.data.ata).toISOString().split('T')[0] : prev.ata,
        }));
        toast.success('Container information loaded successfully!');
      }
      setIsAutoTracking(false);
    },
    onError: (error) => {
      console.error('Auto-tracking error:', error);
      toast.error('Could not load container information. Please enter manually.');
      setIsAutoTracking(false);
    },
  });

  // Handle container number blur to trigger auto-tracking
  const handleContainerBlur = () => {
    const containerNumber = formData.container.trim();
    // Only auto-track if:
    // 1. Not editing an existing shipment
    // 2. Container number is valid (4 letters + 7 digits)
    // 3. Not already tracking
    if (!isEditing && containerNumber && /^[A-Z]{4}\d{7}$/.test(containerNumber) && !isAutoTracking) {
      setIsAutoTracking(true);
      autoTrackMutation.mutate({
        containerNumber,
        company: 'AUTO',
      });
    }
  };

  const isEditing = !!editingShipment;

  // Populate form when editing
  useEffect(() => {
    if (editingShipment) {
      setFormData({
        sellerCloudNumber: editingShipment.sellerCloudNumber || "",
        label: editingShipment.label || "",
        supplier: editingShipment.supplier || "",
        cro: editingShipment.cro || "",
        container: editingShipment.container || "",
        mawbNumber: editingShipment.mawbNumber || "",
        carrier: editingShipment.carrier || "",
        status: editingShipment.status || "In transit",
        atd: editingShipment.atd || "",
        pol: editingShipment.pol || "",
        pod: editingShipment.pod || "",
        eta: editingShipment.eta || "",
        ata: editingShipment.ata || "",
        bolNumber: editingShipment.bolNumber || "",
        poNumber: editingShipment.poNumber || "",
      });
      // shipmentType is always ocean now
    } else {
      setFormData(initialFormData);
      // shipmentType is always ocean now
    }
  }, [editingShipment, show]);

  const utils = trpc.useUtils();
  
  const addMutation = trpc.shipments.add.useMutation({
    onSuccess: () => {
      toast.success("Shipment added successfully!");
      utils.shipments.list.invalidate();
      handleClose();
    },
    onError: (error) => {
      toast.error("Failed to add shipment: " + error.message);
    },
  });

  const updateMutation = trpc.shipments.update.useMutation({
    onSuccess: () => {
      toast.success("Shipment updated successfully!");
      utils.shipments.list.invalidate();
      handleClose();
    },
    onError: (error) => {
      toast.error("Failed to update shipment: " + error.message);
    },
  });

  const addBulkMutation = trpc.shipments.addBulk.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} shipment(s) added successfully!`);
      utils.shipments.list.invalidate();
      handleClose();
    },
    onError: (error) => {
      toast.error("Failed to add shipments: " + error.message);
    },
  });

  const handleClose = () => {
    onHide();
    setBulkText("");
    setFormData(initialFormData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && editingShipment) {
      // Update existing shipment
      updateMutation.mutate({
        id: editingShipment.id,
        data: {
          ...formData,
          shipmentType,
        },
      });
    } else if (bulkText.trim()) {
      // Parse bulk text (container numbers separated by newlines)
      const containers = bulkText.trim().split("\n").filter(c => c.trim());
      const shipments = containers.map((container, idx) => ({
        orderNumber: `PO-${Date.now()}-${idx}`,
        label: formData.label || "Bulk Import",
        supplier: formData.supplier || "Unknown",
        cro: formData.cro,
        container: container.trim(),
        mawbNumber: shipmentType === "air" ? container.trim() : "",
        carrier: formData.carrier || "Unknown",
        status: formData.status,
        atd: formData.atd,
        pol: formData.pol || "Unknown",
        pod: formData.pod || "Unknown",
        eta: formData.eta || "TBD",
        ata: formData.ata,
        shipmentType,
        bolNumber: inputMethod === "bol" ? container.trim() : formData.bolNumber,
      }));
      
      addBulkMutation.mutate(shipments);
    } else {
      addMutation.mutate({
        ...formData,
        shipmentType,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info("File upload feature coming soon!");
      // TODO: Implement CSV/Excel parsing
    }
  };

  const isPending = addMutation.isPending || addBulkMutation.isPending || updateMutation.isPending;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="border-bottom-0 pb-2">
        <Modal.Title className="fw-bold">
          {isEditing ? "Edit Shipment" : "Add or update"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Ocean shipments only - Air shipments removed */}

          {/* Input Method Tabs - Only show for new shipments */}
          {!isEditing && (
            <Tabs
              activeKey={inputMethod}
              onSelect={(k) => setInputMethod(k as "container" | "bol")}
              className="mb-4"
            >
              <Tab eventKey="container" title="Container numbers">
                {/* File Upload */}
                <div className="border border-2 border-dashed rounded p-4 text-center mb-3 bg-light">
                  <Upload className="mx-auto mb-2 text-primary" size={32} />
                  <label htmlFor="file-upload" className="text-primary fw-medium cursor-pointer">
                    Click here to add your spreadsheet
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="d-none"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="text-center text-muted mb-3">or</div>

                {/* Bulk Paste */}
                <div>
                  <Form.Label className="fw-medium">Copy and paste</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder={`Paste your ${shipmentType === "ocean" ? "container" : "AWB"} number(s) here\nMSKU9621299\nMEDU8707688`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  />
                </div>
              </Tab>
              <Tab eventKey="bol" title="BoL numbers">
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Paste your BoL number(s) here"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                />
              </Tab>
            </Tabs>
          )}

          {/* Form Fields */}
          <div className={isEditing ? "" : "border-top pt-3"}>
            <h6 className="fw-bold mb-3">
              {isEditing ? "Shipment Details" : "Additional Details (Optional)"}
            </h6>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">SellerCloud #</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., SC-2889-BD"
                    value={formData.sellerCloudNumber}
                    onChange={(e) => handleChange("sellerCloudNumber", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">PO Number (SellerCloud)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., PO-123456"
                    value={formData.poNumber}
                    onChange={(e) => handleChange("poNumber", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Label</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Cotton"
                    value={formData.label}
                    onChange={(e) => handleChange("label", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Supplier</Form.Label>
                  <Form.Select
                    value={formData.supplier}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                  >
                    <option value="">Select a supplier</option>
                    {suppliers?.map((supplier) => (
                      <option key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Carrier</Form.Label>
                  <Form.Select
                    value={formData.carrier}
                    onChange={(e) => handleChange("carrier", e.target.value)}
                  >
                    <option value="">Select a carrier</option>
                    {carriers?.map((carrier) => (
                      <option key={carrier.id} value={carrier.name}>
                        {carrier.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {isEditing && (
                <>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">
                        Container Number
                        {isAutoTracking && <span className="ms-2 text-muted small">(Loading tracking data...)</span>}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., MSCU8473920"
                        value={formData.container}
                        onChange={(e) => handleChange("container", e.target.value.toUpperCase())}
                        onBlur={handleContainerBlur}
                        disabled={isAutoTracking}
                      />
                      <Form.Text className="text-muted">
                        Enter container number to auto-load tracking information
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">MAWB Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., 123-45678901"
                        value={formData.mawbNumber}
                        onChange={(e) => handleChange("mawbNumber", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">CRO</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., CRO-001"
                        value={formData.cro}
                        onChange={(e) => handleChange("cro", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">ATD</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.atd}
                        onChange={(e) => handleChange("atd", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium small">ATA</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.ata}
                        onChange={(e) => handleChange("ata", e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Port of Loading</Form.Label>
                  <Form.Select
                    value={formData.pol}
                    onChange={(e) => handleChange("pol", e.target.value)}
                  >
                    <option value="">Select a port</option>
                    {polPorts?.map((port) => (
                      <option key={port.id} value={port.name}>
                        {port.name} {port.code && `(${port.code})`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Port of Discharge</Form.Label>
                  <Form.Select
                    value={formData.pod}
                    onChange={(e) => handleChange("pod", e.target.value)}
                  >
                    <option value="">Select a port</option>
                    {podPorts?.map((port) => (
                      <option key={port.id} value={port.name}>
                        {port.name} {port.code && `(${port.code})`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">ETA</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.eta}
                    onChange={(e) => handleChange("eta", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="In transit">In transit</option>
                    <option value="Gated in full">Gated in full</option>
                    <option value="Loaded at Pol">Loaded at Pol</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Customs Hold">Customs Hold</option>
                    <option value="Vessel Departed">Vessel Departed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <Button variant="outline-secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Next")}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
