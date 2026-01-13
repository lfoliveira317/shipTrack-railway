import { useState } from "react";
import { Container, Row, Col, Nav, Navbar, Form, FormControl, Button, Table, Badge, Dropdown, Card, Tabs, Tab, Offcanvas, Modal } from "react-bootstrap";
import { Route, Switch } from "wouter";
import { Bell, Search, Grid as GridIcon, List, Map as MapIcon, FileText, Settings, LogOut, User, ChevronDown, Filter, Download, Plus, Menu, Calendar, Globe, Share2, Mail, Paperclip, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { AddShipmentModal } from "./components/AddShipmentModal";
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
    <div className="d-flex flex-column h-100 bg-white">
      <div className="p-4 border-bottom d-none d-lg-block">
        <div className="d-flex align-items-center fw-bold fs-4 text-dark">
          <span className="text-primary me-2">●</span> Beacon
        </div>
      </div>
      
      <div className="flex-grow-1 py-3">
        <div className="px-3 mb-2 text-uppercase small fw-bold text-muted" style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>Workspace</div>
        <Nav className="flex-column mb-4">
          <Nav.Link href="#" className="text-secondary px-4 py-2 fw-medium">
            <FileText size={18} className="me-3" />
            Orders & Shipments
          </Nav.Link>
          <Nav.Link href="#" className="text-dark px-4 py-2 bg-light fw-medium border-start border-3 border-primary">
            <GridIcon size={18} className="me-3 text-primary" />
            Live Boards
          </Nav.Link>
          <Nav.Link href="#" className="text-secondary px-4 py-2 fw-medium">
            <MapIcon size={18} className="me-3" />
            Plan
          </Nav.Link>
          <Nav.Link href="#" className="text-secondary px-4 py-2 fw-medium">
            <FileText size={18} className="me-3" />
            Report
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
            A
          </div>
          <div className="flex-grow-1 overflow-hidden">
            <div className="fw-bold text-truncate small">Admin User</div>
            <div className="text-muted text-truncate small" style={{ fontSize: "11px" }}>Logistics Manager</div>
          </div>
          <LogOut size={16} className="text-muted ms-2" />
        </div>
      </div>
    </div>
  );
}

function Topbar({ onToggleSidebar, onNewShipment, onShowNotifications }: { onToggleSidebar: () => void; onNewShipment: () => void; onShowNotifications: () => void }) {
  return (
    <Navbar bg="white" className="border-bottom py-2 px-3 px-lg-4">
      <div className="d-flex align-items-center w-100">
        <Button variant="link" className="p-0 me-3 text-dark d-lg-none" onClick={onToggleSidebar}>
          <Menu size={24} />
        </Button>
        
        <div className="d-flex align-items-center gap-3 me-auto">
          <span className="fw-bold text-primary fs-5 d-none d-md-inline">Beacon</span>
          <Nav className="d-none d-md-flex">
            <Nav.Link href="#" className="text-secondary">Orders & Shipments</Nav.Link>
            <Nav.Link href="#" className="text-dark fw-bold">Live Boards</Nav.Link>
            <Nav.Link href="#" className="text-secondary">Plan</Nav.Link>
            <Nav.Link href="#" className="text-secondary">Report</Nav.Link>
          </Nav>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          <Button variant="primary" className="d-flex align-items-center gap-2 fw-medium px-3" onClick={onNewShipment}>
            <Plus size={16} />
            <span className="d-none d-sm-inline">Add</span>
          </Button>
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="p-2 text-dark text-decoration-none">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                A
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={onShowNotifications}>
                <Bell size={16} className="me-2" />
                Email notifications
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>
                <Settings size={16} className="me-2" />
                Settings
              </Dropdown.Item>
              <Dropdown.Item>
                <LogOut size={16} className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
}

function NotificationSettingsModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const [settings, setSettings] = useState({
    oceanArrivals: "daily",
    oceanEtaChanges: "daily",
    airAwbDeparture: "live",
  });

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Email notifications for Untitled Live Board</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div className="fw-bold">Ocean: Arrivals</div>
              <small className="text-muted">A summary of containers that have arrived at PoD</small>
            </div>
            <div className="btn-group btn-group-sm" role="group">
              <input type="radio" className="btn-check" name="oceanArrivals" id="oceanArrivals-off" checked={settings.oceanArrivals === "off"} onChange={() => setSettings({...settings, oceanArrivals: "off"})} />
              <label className="btn btn-outline-secondary" htmlFor="oceanArrivals-off">Off</label>
              <input type="radio" className="btn-check" name="oceanArrivals" id="oceanArrivals-daily" checked={settings.oceanArrivals === "daily"} onChange={() => setSettings({...settings, oceanArrivals: "daily"})} />
              <label className="btn btn-outline-secondary" htmlFor="oceanArrivals-daily">Daily</label>
              <input type="radio" className="btn-check" name="oceanArrivals" id="oceanArrivals-weekly" checked={settings.oceanArrivals === "weekly"} onChange={() => setSettings({...settings, oceanArrivals: "weekly"})} />
              <label className="btn btn-outline-secondary" htmlFor="oceanArrivals-weekly">Weekly</label>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div className="fw-bold">Ocean: ETA changes</div>
              <small className="text-muted">A summary of containers that have an ETA change</small>
            </div>
            <div className="btn-group btn-group-sm" role="group">
              <input type="radio" className="btn-check" name="oceanEta" id="oceanEta-off" checked={settings.oceanEtaChanges === "off"} onChange={() => setSettings({...settings, oceanEtaChanges: "off"})} />
              <label className="btn btn-outline-secondary" htmlFor="oceanEta-off">Off</label>
              <input type="radio" className="btn-check" name="oceanEta" id="oceanEta-daily" checked={settings.oceanEtaChanges === "daily"} onChange={() => setSettings({...settings, oceanEtaChanges: "daily"})} />
              <label className="btn btn-outline-secondary" htmlFor="oceanEta-daily">Daily</label>
              <input type="radio" className="btn-check" name="oceanEta" id="oceanEta-weekly" checked={settings.oceanEtaChanges === "weekly"} onChange={() => setSettings({...settings, oceanEtaChanges: "weekly"})} />
              <label className="btn btn-outline-secondary" htmlFor="oceanEta-weekly">Weekly</label>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div className="fw-bold">Air: AWB departure confirmation</div>
              <small className="text-muted">AWBs that have departed from origin airport</small>
            </div>
            <div className="btn-group btn-group-sm" role="group">
              <input type="radio" className="btn-check" name="airAwb" id="airAwb-off" checked={settings.airAwbDeparture === "off"} onChange={() => setSettings({...settings, airAwbDeparture: "off"})} />
              <label className="btn btn-outline-secondary" htmlFor="airAwb-off">Off</label>
              <input type="radio" className="btn-check" name="airAwb" id="airAwb-live" checked={settings.airAwbDeparture === "live"} onChange={() => setSettings({...settings, airAwbDeparture: "live"})} />
              <label className="btn btn-outline-secondary" htmlFor="airAwb-live">Live</label>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => { toast.success("Notification settings saved!"); onHide(); }}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function Dashboard() {
  const { data: shipments, isLoading } = trpc.shipments.list.useQuery();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar" | "globe">("grid");

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
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-3">
        <div className="d-flex gap-2 align-items-center">
          <Button variant="white" className="border d-flex align-items-center gap-2 text-secondary bg-white" onClick={() => toast.info("Filter coming soon!")}>
            <Filter size={16} /> Filters
          </Button>
          <div className="btn-group" role="group">
            <button type="button" className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setViewMode("grid")} title="Grid view">
              <GridIcon size={16} />
            </button>
            <button type="button" className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setViewMode("list")} title="List view">
              <List size={16} />
            </button>
            <button type="button" className={`btn btn-sm ${viewMode === "calendar" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => { setViewMode("calendar"); toast.info("Calendar view coming soon!"); }} title="Calendar view">
              <Calendar size={16} />
            </button>
            <button type="button" className={`btn btn-sm ${viewMode === "globe" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => { setViewMode("globe"); toast.info("Globe view coming soon!"); }} title="Globe view">
              <Globe size={16} />
            </button>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="white" className="border d-flex align-items-center gap-2 text-secondary bg-white" onClick={() => toast.info("Share coming soon!")}>
            <Share2 size={16} /> Share
          </Button>
          <Button variant="white" className="border d-flex align-items-center gap-2 text-secondary bg-white" onClick={() => toast.info("Email alert coming soon!")}>
            <Mail size={16} /> Email alert
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle table-sm" style={{ minWidth: "1400px", fontSize: "0.875rem" }}>
              <thead className="bg-light text-muted text-uppercase small fw-bold sticky-top">
                <tr>
                  <th className="py-2 ps-3" style={{ width: "30px" }}>#</th>
                  <th className="py-2">Order Number</th>
                  <th className="py-2">Supplier</th>
                  <th className="py-2">CRO</th>
                  <th className="py-2">Container number</th>
                  <th className="py-2">MAWB number</th>
                  <th className="py-2">Carrier</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">ATD</th>
                  <th className="py-2">ETA</th>
                  <th className="py-2">ATA</th>
                  <th className="py-2">Port of loading</th>
                  <th className="py-2">Port of discharge</th>
                  <th className="py-2 pe-3" style={{ width: "80px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments && shipments.length > 0 ? (
                  shipments.map((shipment, idx) => (
                    <tr key={shipment.id} className="border-bottom bg-white">
                      <td className="py-2 ps-3 text-muted small">{idx + 1}</td>
                      <td className="py-2 fw-medium text-primary cursor-pointer">{shipment.orderNumber}</td>
                      <td className="py-2 text-dark">{shipment.supplier}</td>
                      <td className="py-2 text-muted small">{shipment.cro || "-"}</td>
                      <td className="py-2 font-monospace small text-muted">{shipment.container}</td>
                      <td className="py-2 font-monospace small text-muted">{shipment.mawbNumber || "-"}</td>
                      <td className="py-2">{shipment.carrier}</td>
                      <td className="py-2"><Badge bg={getStatusBadge(shipment.status)} className="rounded-pill fw-normal px-2 py-1" style={{ fontSize: "0.75rem" }}>{shipment.status}</Badge></td>
                      <td className="py-2 text-muted small">{shipment.atd || "-"}</td>
                      <td className="py-2 fw-medium small">{shipment.eta}</td>
                      <td className="py-2 text-muted small">{shipment.ata || "-"}</td>
                      <td className="py-2 text-muted">{shipment.pol}</td>
                      <td className="py-2 text-muted">{shipment.pod}</td>
                      <td className="py-2 pe-3">
                        <div className="d-flex gap-2">
                          <Button variant="link" size="sm" className="p-1 text-muted" onClick={() => toast.info("Attachments coming soon!")}>
                            <Paperclip size={16} />
                          </Button>
                          <Button variant="link" size="sm" className="p-1 text-muted" onClick={() => toast.info("Comments coming soon!")}>
                            <MessageSquare size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="text-center py-5 text-muted">
                      No shipments found. Click "Add" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

      {/* Modals */}
      <AddShipmentModal show={showNewShipmentModal} onHide={() => setShowNewShipmentModal(false)} />
      <NotificationSettingsModal show={showNotifications} onHide={() => setShowNotifications(false)} />

      <div className="d-flex flex-column flex-grow-1 h-100 overflow-hidden">
        <Topbar 
          onToggleSidebar={handleShow} 
          onNewShipment={() => setShowNewShipmentModal(true)}
          onShowNotifications={() => setShowNotifications(true)}
        />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
