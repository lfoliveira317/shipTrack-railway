import { useState } from "react";
import { Modal, Button, Form, Row, Col, Tabs, Tab } from "react-bootstrap";
import { Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AddShipmentModalProps {
  show: boolean;
  onHide: () => void;
}

export function AddShipmentModal({ show, onHide }: AddShipmentModalProps) {
  const [shipmentType, setShipmentType] = useState<"ocean" | "air">("ocean");
  const [inputMethod, setInputMethod] = useState<"container" | "bol">("container");
  const [bulkText, setBulkText] = useState("");
  const [formData, setFormData] = useState({
    orderNumber: "",
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
  });

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

  const addBulkMutation = trpc.shipments.addBulk.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.length} shipment(s) added successfully!`);
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
    setFormData({
      orderNumber: "",
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
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bulkText.trim()) {
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

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="border-bottom-0 pb-2">
        <Modal.Title className="fw-bold">Add or update</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Form onSubmit={handleSubmit}>
          {/* Shipment Type Tabs */}
          <div className="mb-4">
            <div className="d-flex gap-3">
              <Button
                variant={shipmentType === "ocean" ? "primary" : "outline-secondary"}
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3"
                onClick={() => setShipmentType("ocean")}
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 18h18M3 18s3-3 9-3 9 3 9 3M3 18v-2M21 18v-2M12 15V9M12 9L8 13M12 9l4 4" />
                </svg>
                <div className="text-start">
                  <div className="fw-bold">Ocean shipments</div>
                  <small className="text-muted">Add container numbers</small>
                </div>
              </Button>
              <Button
                variant={shipmentType === "air" ? "primary" : "outline-secondary"}
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3"
                onClick={() => setShipmentType("air")}
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                <div className="text-start">
                  <div className="fw-bold">Air shipments</div>
                  <small className="text-muted">Add AWB numbers</small>
                </div>
              </Button>
            </div>
          </div>

          {/* Input Method Tabs */}
          <Tabs
            activeKey={inputMethod}
            onSelect={(k) => setInputMethod(k as "container" | "bol")}
            className="mb-4"
          >
            <Tab eventKey="container" title={shipmentType === "ocean" ? "Container numbers" : "AWB numbers"}>
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

          {/* Optional Fields */}
          <div className="border-top pt-3">
            <h6 className="fw-bold mb-3">Additional Details (Optional)</h6>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Order Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., PO-2889-BD"
                    value={formData.orderNumber}
                    onChange={(e) => handleChange("orderNumber", e.target.value)}
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
                  <Form.Control
                    type="text"
                    placeholder="e.g., Dhaka Trim Supplies"
                    value={formData.supplier}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Carrier</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., MSC"
                    value={formData.carrier}
                    onChange={(e) => handleChange("carrier", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Port of Loading</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Chittagong"
                    value={formData.pol}
                    onChange={(e) => handleChange("pol", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">Port of Discharge</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Savannah"
                    value={formData.pod}
                    onChange={(e) => handleChange("pod", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium small">ETA</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Thu, 30 Jan"
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
                    <option value="Customs Hold">Customs Hold</option>
                    <option value="Vessel Departed">Vessel Departed</option>
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
              disabled={addMutation.isPending || addBulkMutation.isPending}
            >
              {addMutation.isPending || addBulkMutation.isPending ? "Adding..." : "Next"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
