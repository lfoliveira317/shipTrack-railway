import { useState } from "react";
import { Container, Nav, Navbar, Button, Row, Col, Card, Table, Badge, Tabs, Tab } from "react-bootstrap";
import { Route, Switch } from "wouter";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Mock Data
const shipments = [
  { id: "PO-2889-BD", label: "Cotton", supplier: "Dhaka Trim Supplies", container: "MSCU8473920", carrier: "MSC", status: "Gated in full", pol: "Chittagong", pod: "Savannah", eta: "Thu, 30 Jan" },
  { id: "PO-2901-VN", label: "Polyester", supplier: "Hanoi Textiles", container: "HLBU5829461", carrier: "Hapag-Lloyd", status: "Loaded at Pol", pol: "Haiphong", pod: "Data", eta: "Tue, 21 Jan" },
  { id: "PO-2847-CN", label: "Zippers", supplier: "Hangzhou Fasteners", container: "OOLU6291847", carrier: "OOCL", status: "In transit", pol: "Yantian", pod: "Oakland", eta: "Mon, 06 Jan" },
  { id: "PO-2756-IN", label: "Jersey", supplier: "Mumbai Fabrics", container: "TEMU9384756", carrier: "Maersk", status: "Arrived", pol: "Nhava Sheva", pod: "Felixstowe", eta: "Sat, 16 Nov" },
  { id: "PO-2895-TW", label: "Thread", supplier: "Taipei Threads", container: "TCLU4829103", carrier: "Evergreen", status: "Customs Hold", pol: "Kaohsiung", pod: "Los Angeles", eta: "Wed, 20 Nov" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Gated in full": return "warning";
    case "Loaded at Pol": return "info";
    case "In transit": return "primary";
    case "Arrived": return "success";
    case "Customs Hold": return "danger";
    default: return "secondary";
  }
};

function Navigation() {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom py-3 sticky-top">
      <Container>
        <Navbar.Brand href="/" className="fw-bold fs-3 text-dark d-flex align-items-center">
          <span className="text-primary me-2">●</span> Beacon
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-4">
            <Nav.Link href="#products" className="fw-medium text-dark mx-2">Products</Nav.Link>
            <Nav.Link href="#solutions" className="fw-medium text-dark mx-2">Solutions</Nav.Link>
            <Nav.Link href="#pricing" className="fw-medium text-dark mx-2">Pricing</Nav.Link>
            <Nav.Link href="#resources" className="fw-medium text-dark mx-2">Resources</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <Nav.Link href="#login" className="fw-medium text-dark mx-2">Login</Nav.Link>
            <Button variant="outline-dark" className="mx-2 fw-medium px-4 rounded-pill">Talk to Us</Button>
            <Button variant="primary" className="mx-2 fw-bold px-4 rounded-pill text-white">Start Free Trial</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function Hero() {
  return (
    <section className="py-5 bg-light position-relative overflow-hidden">
      <Container className="py-5 text-center position-relative" style={{ zIndex: 1 }}>
        <p className="text-uppercase text-muted fw-bold letter-spacing-2 mb-3">Your AI Supply Chain Workspace</p>
        <h1 className="display-3 fw-bold mb-4 text-dark" style={{ letterSpacing: "-0.02em" }}>
          Imagine if your <span className="text-primary">supply chain</span><br />
          spreadsheet could update itself
        </h1>
        <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: "800px" }}>
          Buyers, Consignees and Freight Forwarders - Manage your ocean and air shipments in the format you love without manual data entry, outdated information and endless email chains.
        </p>
        <div className="mb-5">
          <p className="fw-bold text-dark mb-3">Track unlimited shipments for 30 days, no credit card required</p>
          <Button variant="primary" size="lg" className="px-5 py-3 rounded-pill fw-bold text-white shadow-sm">
            Start Your Free Trial
          </Button>
        </div>
      </Container>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="py-5 bg-white">
      <Container>
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <Card.Header className="bg-white border-bottom p-0">
            <Tabs defaultActiveKey="table" id="dashboard-tabs" className="border-0 px-4 pt-3">
              <Tab eventKey="table" title="Table" className="pb-3" />
              <Tab eventKey="documents" title="Documents" disabled />
              <Tab eventKey="alerts" title="Alerts" disabled />
              <Tab eventKey="live-boards" title="Live Boards" disabled />
              <Tab eventKey="maps" title="Maps" disabled />
            </Tabs>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle" style={{ minWidth: "1000px" }}>
                <thead className="bg-light text-muted text-uppercase small fw-bold">
                  <tr>
                    <th className="py-3 ps-4">Order No.</th>
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
                    <tr key={idx} className="border-bottom">
                      <td className="py-3 ps-4 fw-medium text-dark">{shipment.id}</td>
                      <td className="py-3"><Badge bg="light" text="dark" className="border fw-normal">{shipment.label}</Badge></td>
                      <td className="py-3 text-muted">{shipment.supplier}</td>
                      <td className="py-3 font-monospace small">{shipment.container}</td>
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
          <Card.Footer className="bg-light border-top p-3 text-center text-muted small">
            Showing 5 of 124 active shipments
          </Card.Footer>
        </Card>
      </Container>
    </section>
  );
}

function Features() {
  const features = [
    { title: "One Table", desc: "All your shipments and orders in a single view that everyone sees simultaneously." },
    { title: "Automatic Updates", desc: "Data flows in from multiple sources in real-time. Container ETAs, carrier information, and status changes." },
    { title: "Your Familiar Format", desc: "Keep your custom columns and fields in your familiar spreadsheet format." },
  ];

  return (
    <section className="py-5 bg-light">
      <Container className="py-5">
        <Row className="g-4">
          {features.map((feature, idx) => (
            <Col md={4} key={idx}>
              <Card className="h-100 border-0 bg-transparent">
                <Card.Body>
                  <h3 className="h4 fw-bold mb-3">{feature.title}</h3>
                  <p className="text-muted">{feature.desc}</p>
                  <a href="#" className="text-primary fw-bold text-decoration-none">Learn more →</a>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-dark text-white py-5">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <h4 className="fw-bold mb-4 d-flex align-items-center">
              <span className="text-primary me-2">●</span> Beacon
            </h4>
            <p className="text-white-50">
              The supply chain visibility platform that helps you take control of your freight.
            </p>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3 text-uppercase small letter-spacing-2">Product</h6>
            <ul className="list-unstyled text-white-50">
              <li className="mb-2"><a href="#" className="text-reset text-decoration-none">Features</a></li>
              <li className="mb-2"><a href="#" className="text-reset text-decoration-none">Pricing</a></li>
              <li className="mb-2"><a href="#" className="text-reset text-decoration-none">Integrations</a></li>
            </ul>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3 text-uppercase small letter-spacing-2">Company</h6>
            <ul className="list-unstyled text-white-50">
              <li className="mb-2"><a href="#" className="text-reset text-decoration-none">About Us</a></li>
              <li className="mb-2"><a href="#" className="text-reset text-decoration-none">Careers</a></li>
              <li className="mb-2"><a href="#" className="text-reset text-decoration-none">Contact</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h6 className="fw-bold mb-3 text-uppercase small letter-spacing-2">Subscribe</h6>
            <p className="text-white-50 mb-3">Get the latest supply chain insights.</p>
            <div className="d-flex">
              <input type="email" className="form-control me-2" placeholder="Email address" />
              <Button variant="primary">Join</Button>
            </div>
          </Col>
        </Row>
        <div className="border-top border-secondary mt-5 pt-4 text-center text-white-50 small">
          © 2026 Beacon Platform Inc. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}

function Home() {
  return (
    <div className="bg-light min-vh-100 d-flex flex-col">
      <Navigation />
      <main className="flex-grow-1">
        <Hero />
        <DashboardPreview />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route>404: No such page!</Route>
    </Switch>
  );
}

export default App;
