import { useState } from "react";
import { Container, Row, Col, Nav, Navbar, Form, FormControl, Button, Table, Badge, Dropdown, Card, Tabs, Tab, Offcanvas, Modal } from "react-bootstrap";
import { Route, Switch } from "wouter";
import { Bell, Search, Grid, List, Map as MapIcon, FileText, Settings, LogOut, User, ChevronDown, Filter, Download, Plus, Menu } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Gated in full": return "warning";
    case "Loaded at Pol": return "info";
    case "In transit": return "primary";
    case "Arrived": return "success";
    case "Customs Hold": return "danger";
    case "Vessel Departed": return "info";
    default: return "secondary";
  }
};

function SidebarContent() {
  return (
    <div className="d-flex flex-col h-100 bg-white">
      <div className="p-4 border-bottom d-none d-lg-block">
        <div className="d-flex align-items-center fw-bold fs-4 text-dark">
          <span className="text-primary me-2">●</span> Beacon
        </div>
      </div>
      
      <div className="flex-grow-1 py-3">
        <div className="px-3 mb-2 text-uppercase small fw-bold text-muted" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Workspace</div>
        <Nav className="flex-column mb-4">
          <Nav.Link href="#" className="text-dark px-4 py-2 bg-light fw-medium border-start border-3 border-primary">
            <Grid size={18} className="me-3 text-primary" />
            Dashboard
          </Nav.Link>
          <Nav.Link href="#" className="text-secondary px-4 py-2 fw-medium">
            <List size={18} className="me-3" />
            Shipments
          </Nav.Link>
          <Nav.Link href="#" className="text-secondary px-4 py-2 fw-medium">
            <FileText size={18} className="me-3" />
            Orders
          </Nav.Link>
          <Nav.Link href="#" className="text-secondary px-4 py-2 fw-medium">
            <MapIcon size={18} className="me-3" />
            Live Map
          </Nav.Link>
        </Nav>

        <div className="px-3 mb-2 text-uppercase small fw-bold text-muted" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Management</div>
        <Nav className="flex-column">
          <Nav.Link href="#" className="text-secondary px-4 py-2 fw-medium">
            <User size={18} className="me-3" />
            Team
          </Nav.Link>
          <Nav.Link href="#" className="text-secondary px-4 py-2 fw-medium">
            <Settings size={18} className="me-3" />
            Settings
          </Nav.Link>
        </Nav>
      </div>

      <div className="p-3 border-top mt-auto">
        <div className="d-flex align-items-center p-2 rounded hover-bg-light cursor-pointer">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
            JD
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <div className="fw-bold text-truncate small">John Doe</div>
            <div className="text-muted text-truncate small" style={{ fontSize: "11px" }}>Logistics Manager</div>
          </div>
          <LogOut size={16} className="text-muted ms-2" />
        </div>
      </div>
    </div>
  );
}

function Topbar({ onToggleSidebar, onNewShipment }: { onToggleSidebar: () => void; onNewShipment: () => void }) {
  return (
    <Navbar bg="white" className="border-bottom py-2 px-3 px-lg-4 sticky-top">
      <div className="d-flex align-items-center w-100">
        <Button variant="link" className="p-0 me-3 text-dark d-lg-none" onClick={onToggleSidebar}>
          <Menu size={24} />
        </Button>
        
        <h4 className="mb-0 fw-bold me-4 d-none d-md-block">Shipments</h4>
        <h4 className="mb-0 fw-bold me-4 d-md-none fs-5">Shipments</h4>
        
        <div className="position-relative flex-grow-1 d-none d-md-block" style={{ maxWidth: "400px" }}>
          <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <FormControl 
            type="text" 
            placeholder="Search PO, Container, or Supplier..." 
            className="ps-5 bg-light border-0"
            style={{ fontSize: "0.9rem" }}
          />
        </div>

        <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
          <Button variant="light" className="d-md-none p-2 rounded-circle text-secondary">
            <Search size={20} />
          </Button>
          <Button variant="light" className="position-relative p-2 rounded-circle text-secondary">
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </Button>
          <Button variant="primary" className="d-flex align-items-center gap-2 fw-medium px-3 d-none d-sm-flex" onClick={onNewShipment}>
            <Plus size={16} />
            <span>New Shipment</span>
          </Button>
          <Button variant="primary" className="d-flex align-items-center justify-content-center p-2 rounded-circle d-sm-none" onClick={onNewShipment}>
            <Plus size={20} />
          </Button>
        </div>
      </div>
    </Navbar>
  );
}

function NewShipmentModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const [formData, setFormData] = useState({
    label: "",
    supplier: "",
    container: "",
    carrier: "",
    status: "In transit",
    pol: "",
    pod: "",
    eta: "",
  });

  const utils = trpc.useUtils();
  const addMutation = trpc.shipments.add.useMutation({
    onSuccess: () => {
      toast.success("Shipment added successfully!");
      utils.shipments.list.invalidate();
      onHide();
      setFormData({
        label: "",
        supplier: "",
        container: "",
        carrier: "",
        status: "In transit",
        pol: "",
        pod: "",
        eta: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to add shipment: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">New Shipment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Label</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Cotton"
                  value={formData.label}
                  onChange={(e) => handleChange("label", e.target.value)}
                  required
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
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Container</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., MSCU8473920"
                  value={formData.container}
                  onChange={(e) => handleChange("container", e.target.value)}
                  required
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
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  required
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
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">ETA</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Thu, 30 Jan"
                  value={formData.eta}
                  onChange={(e) => handleChange("eta", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Port of Loading (POL)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Chittagong"
                  value={formData.pol}
                  onChange={(e) => handleChange("pol", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-medium small">Port of Discharge (POD)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Savannah"
                  value={formData.pod}
                  onChange={(e) => handleChange("pod", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Adding..." : "Add Shipment"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

function Dashboard() {
  const { data: shipments, isLoading } = trpc.shipments.list.useQuery();

  if (isLoading) {
    return (
      <div className="p-4 h-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 p-lg-4 h-100 bg-light overflow-auto">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
        <div className="d-flex gap-2 w-100 w-sm-auto">
          <Button variant="white" className="border d-flex align-items-center gap-2 text-secondary bg-white flex-grow-1 flex-sm-grow-0 justify-content-center">
            <Filter size={16} /> Filter
          </Button>
          <Button variant="white" className="border d-flex align-items-center gap-2 text-secondary bg-white flex-grow-1 flex-sm-grow-0 justify-content-center">
            <Download size={16} /> Export
          </Button>
        </div>
        <div className="text-muted small ms-auto ms-sm-0">
          Last updated: <span className="fw-bold text-dark">Just now</span>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Card.Header className="bg-white border-bottom p-0">
          <Tabs defaultActiveKey="all" id="shipment-tabs" className="border-0 px-3 px-lg-4 pt-3 flex-nowrap overflow-auto no-scrollbar">
            <Tab eventKey="all" title={`All Shipments (${shipments?.length || 0})`} className="pb-3" />
            <Tab eventKey="active" title="Active" />
            <Tab eventKey="attention" title="Needs Attention" />
            <Tab eventKey="completed" title="Completed" />
          </Tabs>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle" style={{ minWidth: "1000px" }}>
              <thead className="bg-light text-muted text-uppercase small fw-bold">
                <tr>
                  <th className="py-3 ps-4" style={{ width: "40px" }}>
                    <Form.Check />
                  </th>
                  <th className="py-3">Order No.</th>
                  <th className="py-3">Labels</th>
                  <th className="py-3">Supplier</th>
                  <th className="py-3">Container</th>
                  <th className="py-3">Carrier</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">POL</th>
                  <th className="py-3">POD</th>
                  <th className="py-3 pe-4">ETA</th>
                </tr>
              </thead>
              <tbody>
                {shipments && shipments.length > 0 ? (
                  shipments.map((shipment, idx) => (
                    <tr key={idx} className="border-bottom bg-white">
                      <td className="py-3 ps-4">
                        <Form.Check />
                      </td>
                      <td className="py-3 fw-medium text-primary cursor-pointer">{shipment.id}</td>
                      <td className="py-3"><Badge bg="light" text="dark" className="border fw-normal">{shipment.label}</Badge></td>
                      <td className="py-3 text-dark">{shipment.supplier}</td>
                      <td className="py-3 font-monospace small text-muted">{shipment.container}</td>
                      <td className="py-3">{shipment.carrier}</td>
                      <td className="py-3"><Badge bg={getStatusBadge(shipment.status)} className="rounded-pill fw-normal px-3">{shipment.status}</Badge></td>
                      <td className="py-3 text-muted">{shipment.pol}</td>
                      <td className="py-3 text-muted">{shipment.pod}</td>
                      <td className="py-3 pe-4 fw-medium">{shipment.eta}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-5 text-muted">
                      No shipments found. Click "New Shipment" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="bg-white border-top p-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="text-muted small">Showing {shipments?.length || 0} shipments</div>
          <div className="d-flex gap-2 w-100 w-sm-auto">
            <Button variant="outline-secondary" size="sm" disabled className="flex-grow-1 flex-sm-grow-0">Previous</Button>
            <Button variant="outline-secondary" size="sm" className="flex-grow-1 flex-sm-grow-0">Next</Button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}

function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false);

  const handleClose = () => setShowSidebar(false);
  const handleShow = () => setShowSidebar(true);

  return (
    <div className="d-flex h-100vh w-100 overflow-hidden bg-light">
      {/* Desktop Sidebar */}
      <div className="d-none d-lg-block border-end" style={{ width: "240px", minWidth: "240px" }}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Offcanvas) */}
      <Offcanvas show={showSidebar} onHide={handleClose} responsive="lg">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold fs-4 text-dark">
            <span className="text-primary me-2">●</span> Beacon
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>

      {/* New Shipment Modal */}
      <NewShipmentModal show={showNewShipmentModal} onHide={() => setShowNewShipmentModal(false)} />

      <div className="d-flex flex-column flex-grow-1 h-100 overflow-hidden">
        <Topbar onToggleSidebar={handleShow} onNewShipment={() => setShowNewShipmentModal(true)} />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
