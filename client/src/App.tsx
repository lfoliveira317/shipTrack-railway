import { useState } from "react";
import { Container, Row, Col, Nav, Navbar, Form, FormControl, Button, Table, Badge, Dropdown, Card, Tabs, Tab } from "react-bootstrap";
import { Route, Switch } from "wouter";
import { Bell, Search, Grid, List, Map as MapIcon, FileText, Settings, LogOut, User, ChevronDown, Filter, Download, Plus } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Mock Data
const shipments = [
  { id: "PO-2889-BD", label: "Cotton", supplier: "Dhaka Trim Supplies", container: "MSCU8473920", carrier: "MSC", status: "Gated in full", pol: "Chittagong", pod: "Savannah", eta: "Thu, 30 Jan" },
  { id: "PO-2901-VN", label: "Polyester", supplier: "Hanoi Textiles", container: "HLBU5829461", carrier: "Hapag-Lloyd", status: "Loaded at Pol", pol: "Haiphong", pod: "Data", eta: "Tue, 21 Jan" },
  { id: "PO-2847-CN", label: "Zippers", supplier: "Hangzhou Fasteners", container: "OOLU6291847", carrier: "OOCL", status: "In transit", pol: "Yantian", pod: "Oakland", eta: "Mon, 06 Jan" },
  { id: "PO-2756-IN", label: "Jersey", supplier: "Mumbai Fabrics", container: "TEMU9384756", carrier: "Maersk", status: "Arrived", pol: "Nhava Sheva", pod: "Felixstowe", eta: "Sat, 16 Nov" },
  { id: "PO-2895-TW", label: "Thread", supplier: "Taipei Threads", container: "TCLU4829103", carrier: "Evergreen", status: "Customs Hold", pol: "Kaohsiung", pod: "Los Angeles", eta: "Wed, 20 Nov" },
  { id: "PO-2902-MY", label: "Organic", supplier: "Kuala Lumpur Knits", container: "CMACGM19283", carrier: "CMA CGM", status: "In transit", pol: "Port Klang", pod: "Seattle", eta: "Fri, 14 Feb" },
  { id: "PO-2910-VN", label: "Silk", supplier: "Vietnam Silk Co", container: "ONEU9182736", carrier: "ONE", status: "Vessel Departed", pol: "Ho Chi Minh", pod: "Vancouver", eta: "Mon, 24 Feb" },
  { id: "PO-2915-CN", label: "Buttons", supplier: "Shanghai Accessories", container: "COSU8172635", carrier: "COSCO", status: "Gated in full", pol: "Shanghai", pod: "Long Beach", eta: "Wed, 05 Mar" },
];

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

function Sidebar() {
  return (
    <div className="d-flex flex-col h-100 bg-white border-end" style={{ width: "240px", minWidth: "240px" }}>
      <div className="p-4 border-bottom">
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

      <div className="p-3 border-top">
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

function Topbar() {
  return (
    <Navbar bg="white" className="border-bottom py-2 px-4 sticky-top">
      <div className="d-flex align-items-center w-100">
        <h4 className="mb-0 fw-bold me-4">Shipments</h4>
        
        <div className="position-relative flex-grow-1" style={{ maxWidth: "400px" }}>
          <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <FormControl 
            type="text" 
            placeholder="Search PO, Container, or Supplier..." 
            className="ps-5 bg-light border-0"
            style={{ fontSize: "0.9rem" }}
          />
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <Button variant="light" className="position-relative p-2 rounded-circle text-secondary">
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </Button>
          <Button variant="primary" className="d-flex align-items-center gap-2 fw-medium px-3">
            <Plus size={16} />
            <span>New Shipment</span>
          </Button>
        </div>
      </div>
    </Navbar>
  );
}

function Dashboard() {
  return (
    <div className="p-4 h-100 bg-light overflow-auto">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <Button variant="white" className="border d-flex align-items-center gap-2 text-secondary bg-white">
            <Filter size={16} /> Filter
          </Button>
          <Button variant="white" className="border d-flex align-items-center gap-2 text-secondary bg-white">
            <Download size={16} /> Export
          </Button>
        </div>
        <div className="text-muted small">
          Last updated: <span className="fw-bold text-dark">Just now</span>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Card.Header className="bg-white border-bottom p-0">
          <Tabs defaultActiveKey="all" id="shipment-tabs" className="border-0 px-4 pt-3">
            <Tab eventKey="all" title="All Shipments" className="pb-3" />
            <Tab eventKey="active" title="Active (12)" />
            <Tab eventKey="attention" title="Needs Attention (3)" />
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
                {shipments.map((shipment, idx) => (
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
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="bg-white border-top p-3 d-flex justify-content-between align-items-center">
          <div className="text-muted small">Showing 1-8 of 124 shipments</div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" disabled>Previous</Button>
            <Button variant="outline-secondary" size="sm">Next</Button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}

function App() {
  return (
    <div className="d-flex h-100vh w-100 overflow-hidden bg-light">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1 h-100 overflow-hidden">
        <Topbar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
