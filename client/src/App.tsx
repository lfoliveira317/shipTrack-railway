import { useState, useEffect } from "react";
import {
  Container,
  Navbar,
  Nav,
  Button,
  Table,
  Badge,
  Offcanvas,
  Modal,
  Form,
  Dropdown,
} from "react-bootstrap";
import {
  Menu,
  Search,
  Bell,
  User,
  Plus,
  Share2,
  Mail,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  Globe,
  Paperclip,
  MessageSquare,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { trpc } from "./lib/trpc";
import { AddShipmentModal } from "./components/AddShipmentModal";

type Shipment = {
  id: string;
  orderNumber: string;
  label: string;
  supplier: string;
  cro?: string;
  container: string;
  mawbNumber?: string;
  carrier: string;
  status: string;
  atd?: string;
  pol: string;
  pod?: string;
  eta: string;
  ata?: string;
  shipmentType?: "ocean" | "air";
  bolNumber?: string;
};

type ViewMode = "grid" | "list" | "calendar" | "globe";
type SortField = "orderNumber" | "supplier" | "status" | "carrier" | "eta";
type SortDirection = "asc" | "desc";

function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: shipments = [], refetch } = trpc.shipments.list.useQuery();

  const handleSidebarToggle = () => setShowSidebar(!showSidebar);
  const handleAddModalClose = () => setShowAddModal(false);
  const handleAddModalShow = () => setShowAddModal(true);
  const handleNotificationsClose = () => setShowNotifications(false);
  const handleNotificationsShow = () => setShowNotifications(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedShipments = () => {
    let filtered = [...shipments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.container?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.carrier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";

        if (sortDirection === "asc") {
          return aValue.toString().localeCompare(bValue.toString());
        } else {
          return bValue.toString().localeCompare(aValue.toString());
        }
      });
    }

    return filtered;
  };

  const sortedShipments = getSortedShipments();

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="ms-1" />
    ) : (
      <ChevronDown size={14} className="ms-1" />
    );
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Navigation Bar */}
      <Navbar
        bg="white"
        className="border-bottom px-3"
        style={{ height: "60px" }}
      >
        <Button
          variant="link"
          className="d-lg-none text-dark p-0 me-3"
          onClick={handleSidebarToggle}
        >
          <Menu size={24} />
        </Button>

        <Navbar.Brand href="#" className="fw-bold text-danger fs-4 mb-0">
          <span className="text-danger">●</span> Beacon
        </Navbar.Brand>

        <Nav className="ms-auto d-flex flex-row align-items-center gap-2">
          <div className="position-relative d-none d-md-block">
            <Search
              size={18}
              className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
            />
            <Form.Control
              type="search"
              placeholder="Search shipments..."
              className="ps-5"
              style={{ width: "250px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            variant="link"
            className="text-dark p-2 position-relative"
            onClick={handleNotificationsShow}
          >
            <Bell size={20} />
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: "0.6rem" }}
            >
              3
            </span>
          </Button>

          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              className="text-dark p-0 text-decoration-none"
              id="user-dropdown"
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-danger d-flex align-items-center justify-content-center text-white"
                  style={{ width: "32px", height: "32px" }}
                >
                  A
                </div>
                <div className="d-none d-md-block text-start">
                  <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                    Admin User
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Logistics Manager
                  </div>
                </div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#">Profile</Dropdown.Item>
              <Dropdown.Item href="#">Settings</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="#">Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div
          className="d-none d-lg-flex flex-column bg-light border-end"
          style={{ width: "240px" }}
        >
          <div className="p-3">
            <div className="text-uppercase text-muted small mb-2">
              Workspace
            </div>
            <Nav className="flex-column">
              <Nav.Link
                href="#"
                className="text-dark d-flex align-items-center gap-2 py-2 active"
                style={{ borderLeft: "3px solid #dc3545" }}
              >
                <LayoutGrid size={18} />
                Orders & Shipments
              </Nav.Link>
            </Nav>
          </div>

          <div className="mt-auto p-3 border-top">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-danger d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px" }}
              >
                A
              </div>
              <div>
                <div className="fw-semibold small">Admin User</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Logistics Manager
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Mobile (Offcanvas) */}
        <Offcanvas
          show={showSidebar}
          onHide={handleSidebarToggle}
          placement="start"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className="fw-bold text-danger">
              <span className="text-danger">●</span> Beacon
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <div className="p-3">
              <div className="text-uppercase text-muted small mb-2">
                Workspace
              </div>
              <Nav className="flex-column">
                <Nav.Link
                  href="#"
                  className="text-dark d-flex align-items-center gap-2 py-2 active"
                  style={{ borderLeft: "3px solid #dc3545" }}
                >
                  <LayoutGrid size={18} />
                  Orders & Shipments
                </Nav.Link>
              </Nav>
            </div>

            <div className="mt-auto p-3 border-top">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-danger d-flex align-items-center justify-content-center text-white"
                  style={{ width: "36px", height: "36px" }}
                >
                  A
                </div>
                <div>
                  <div className="fw-semibold small">Admin User</div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Logistics Manager
                  </div>
                </div>
              </div>
            </div>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          {/* Secondary Navigation */}
          <div className="bg-white border-bottom px-3 py-2">
            <Nav className="gap-3">
              <Nav.Link
                href="#"
                className="text-danger fw-semibold border-bottom border-danger border-2 pb-2"
              >
                Beacon
              </Nav.Link>
              <Nav.Link href="#" className="text-dark">
                Orders & Shipments
              </Nav.Link>
              <Nav.Link href="#" className="text-dark">
                Live Boards
              </Nav.Link>
            </Nav>
          </div>

          {/* Mobile Search Bar */}
          <div className="bg-white border-bottom px-3 py-2 d-md-none">
            <div className="position-relative">
              <Search
                size={18}
                className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
              />
              <Form.Control
                type="search"
                placeholder="Search shipments..."
                className="ps-5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white border-bottom px-3 py-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center gap-1"
                  >
                    <Filter size={16} />
                    Filters
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Header>Sort by</Dropdown.Header>
                    <Dropdown.Item onClick={() => handleSort("orderNumber")}>
                      Order Number{" "}
                      {sortField === "orderNumber" && (
                        <span className="float-end">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort("supplier")}>
                      Supplier{" "}
                      {sortField === "supplier" && (
                        <span className="float-end">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort("status")}>
                      Status{" "}
                      {sortField === "status" && (
                        <span className="float-end">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort("carrier")}>
                      Carrier{" "}
                      {sortField === "carrier" && (
                        <span className="float-end">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSort("eta")}>
                      ETA{" "}
                      {sortField === "eta" && (
                        <span className="float-end">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={() => {
                        setSortField(null);
                        setSearchTerm("");
                      }}
                    >
                      Clear all filters
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <div className="btn-group" role="group">
                  <Button
                    variant={viewMode === "grid" ? "danger" : "outline-secondary"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid size={16} />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "danger" : "outline-secondary"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List size={16} />
                  </Button>
                  <Button
                    variant={
                      viewMode === "calendar" ? "danger" : "outline-secondary"
                    }
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                  >
                    <Calendar size={16} />
                  </Button>
                  <Button
                    variant={viewMode === "globe" ? "danger" : "outline-secondary"}
                    size="sm"
                    onClick={() => setViewMode("globe")}
                  >
                    <Globe size={16} />
                  </Button>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button variant="outline-secondary" size="sm">
                  <Share2 size={16} className="me-1" />
                  Share
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleNotificationsShow}
                >
                  <Mail size={16} className="me-1" />
                  Email alert
                </Button>
                <Button variant="danger" size="sm" onClick={handleAddModalShow}>
                  <Plus size={16} className="me-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Data Grid */}
          <div className="flex-grow-1 overflow-auto p-2 p-md-3">
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <Table bordered hover className="bg-white mb-0" style={{ minWidth: '1200px' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("orderNumber")}
                    >
                      ORDER NUMBER <SortIcon field="orderNumber" />
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("supplier")}
                    >
                      SUPPLIER <SortIcon field="supplier" />
                    </th>
                    <th>CRO</th>
                    <th>CONTAINER NUMBER</th>
                    <th>MAWB NUMBER</th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("carrier")}
                    >
                      CARRIER <SortIcon field="carrier" />
                    </th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("status")}
                    >
                      STATUS <SortIcon field="status" />
                    </th>
                    <th>ATD</th>
                    <th
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("eta")}
                    >
                      ETA <SortIcon field="eta" />
                    </th>
                    <th>ATA</th>
                    <th>PORT OF LOADING</th>
                    <th>PORT OF DISCHARGE</th>
                    <th style={{ width: "100px" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedShipments.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="text-center text-muted py-5">
                        {searchTerm
                          ? "No shipments found matching your search"
                          : "No shipments yet. Click 'Add' to create your first shipment."}
                      </td>
                    </tr>
                  ) : (
                    sortedShipments.map((shipment, index) => (
                      <tr key={shipment.id}>
                        <td className="text-muted">{index + 1}</td>
                        <td className="text-danger fw-semibold">
                          {shipment.orderNumber || "-"}
                        </td>
                        <td>{shipment.supplier}</td>
                        <td>{shipment.cro || "-"}</td>
                        <td>{shipment.container}</td>
                        <td>{shipment.mawbNumber || "-"}</td>
                        <td>{shipment.carrier}</td>
                        <td>
                          <Badge bg="danger">{shipment.status}</Badge>
                        </td>
                        <td>{shipment.atd || "-"}</td>
                        <td>{shipment.eta}</td>
                        <td>{shipment.ata || "-"}</td>
                        <td>{shipment.pol}</td>
                        <td>{shipment.pod || "-"}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-muted"
                            >
                              <Paperclip size={16} />
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-muted"
                            >
                              <MessageSquare size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Shipment Modal */}
      <AddShipmentModal
        show={showAddModal}
        onHide={handleAddModalClose}
      />

      {/* Email Notifications Modal */}
      <Modal
        show={showNotifications}
        onHide={handleNotificationsClose}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Email notifications for Untitled Live Board</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-1">Ocean: Arrivals</h6>
                <p className="text-muted small mb-0">
                  A summary of containers that have arrived at PoD
                </p>
              </div>
              <div className="btn-group" role="group">
                <Button variant="outline-secondary" size="sm">
                  Off
                </Button>
                <Button variant="primary" size="sm">
                  Daily
                </Button>
                <Button variant="outline-secondary" size="sm">
                  Weekly
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-1">Ocean: ETA changes</h6>
                <p className="text-muted small mb-0">
                  A summary of containers that have an ETA change
                </p>
              </div>
              <div className="btn-group" role="group">
                <Button variant="outline-secondary" size="sm">
                  Off
                </Button>
                <Button variant="primary" size="sm">
                  Daily
                </Button>
                <Button variant="outline-secondary" size="sm">
                  Weekly
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="mb-1">Air: AWB departure confirmation</h6>
                <p className="text-muted small mb-0">
                  AWBs that have departed from origin airport
                </p>
              </div>
              <div className="btn-group" role="group">
                <Button variant="outline-secondary" size="sm">
                  Off
                </Button>
                <Button variant="primary" size="sm">
                  Live
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleNotificationsClose}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
