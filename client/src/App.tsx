import { useState } from "react";
import {
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
  Edit2,
  Download,
} from "lucide-react";
import { trpc } from "./lib/trpc";
import { AddShipmentModal } from "./components/AddShipmentModal";
import { CommentsModal } from "./components/CommentsModal";
import AttachmentsModal from "./components/AttachmentsModal";

// Status color mapping for visual recognition
// Orange theme with matching In transit status
const getStatusVariant = (status: string): string => {
  const statusLower = status.toLowerCase();
  
  // Green - Delivered/Arrived
  if (statusLower.includes('delivered') || statusLower.includes('arrived') || statusLower.includes('completed')) {
    return 'success';
  }
  
  // Orange/Warning - In transit (matches app theme)
  if (statusLower.includes('transit') || statusLower.includes('shipping')) {
    return 'warning';
  }
  
  // Blue - Loaded/Gated/Departed
  if (statusLower.includes('loaded') || statusLower.includes('gated') || statusLower.includes('departed')) {
    return 'primary';
  }
  
  // Cyan/Info - Pending/Processing
  if (statusLower.includes('pending') || statusLower.includes('processing') || statusLower.includes('preparing')) {
    return 'info';
  }
  
  // Red - Delayed/Issues/Customs Hold
  if (statusLower.includes('delayed') || statusLower.includes('issue') || statusLower.includes('problem') || statusLower.includes('customs')) {
    return 'danger';
  }
  
  // Gray - Cancelled/On hold
  if (statusLower.includes('cancelled') || statusLower.includes('hold') || statusLower.includes('suspended')) {
    return 'secondary';
  }
  
  // Default - Light gray
  return 'secondary';
};

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
  const [commentsModalShipment, setCommentsModalShipment] = useState<{ id: string; orderNumber: string } | null>(null);
  const [attachmentsModalShipment, setAttachmentsModalShipment] = useState<{ id: string; label: string } | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const { data: shipments = [], refetch } = trpc.shipments.list.useQuery();
  const { data: commentCounts = {} } = trpc.comments.counts.useQuery();
  const { data: attachmentCounts = {} } = trpc.attachments.counts.useQuery();

  const handleSidebarToggle = () => setShowSidebar(!showSidebar);
  const handleAddModalClose = () => {
    setShowAddModal(false);
    setEditingShipment(null);
  };
  const handleAddModalShow = () => setShowAddModal(true);
  const handleNotificationsClose = () => setShowNotifications(false);
  const handleNotificationsShow = () => setShowNotifications(true);

  const handleEditShipment = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setShowAddModal(true);
  };

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

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      "Order Number",
      "Supplier",
      "CRO",
      "Container Number",
      "MAWB Number",
      "Carrier",
      "Status",
      "ATD",
      "ETA",
      "ATA",
      "Port of Loading",
      "Port of Discharge",
    ];

    const csvData = sortedShipments.map((s) => [
      s.orderNumber || "",
      s.supplier || "",
      s.cro || "",
      s.container || "",
      s.mawbNumber || "",
      s.carrier || "",
      s.status || "",
      s.atd || "",
      s.eta || "",
      s.ata || "",
      s.pol || "",
      s.pod || "",
    ]);

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...csvData.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `shipments_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        <Navbar.Brand href="#" className="fw-bold fs-4 mb-0" style={{ color: '#FF5722' }}>
          <span style={{ color: '#FF5722' }}>●</span> Beacon
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
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
              style={{ backgroundColor: '#FF5722', fontSize: "0.6rem" }}
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
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: "32px", height: "32px", backgroundColor: '#FF5722' }}
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
                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: "36px", height: "36px", backgroundColor: '#FF5722' }}
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
            <Offcanvas.Title className="fw-bold" style={{ color: '#FF5722' }}>
              <span style={{ color: '#FF5722' }}>●</span> Beacon
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
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: "36px", height: "36px", backgroundColor: '#FF5722' }}
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
          {/* Content Header Tabs */}
          <div className="bg-white border-bottom">
            <div className="d-flex flex-wrap align-items-center justify-content-between p-2 p-md-3 gap-2">
              <Nav variant="tabs" className="border-0 flex-nowrap">
                <Nav.Item>
                  <Nav.Link className="border-0 border-bottom border-2 fw-semibold" style={{ color: '#FF5722', borderBottomColor: '#FF5722' }}>
                    Beacon
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="text-muted border-0">
                    Orders & Shipments
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className="text-muted border-0">
                    Live Boards
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>

            {/* Mobile Search Bar */}
            <div className="d-md-none px-3 pb-2">
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
            <div className="d-flex flex-wrap align-items-center justify-content-between px-2 px-md-3 pb-2 gap-2">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Dropdown>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="sm"
                    id="filter-dropdown"
                  >
                    <Filter size={16} className="me-1" />
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
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleExportCSV}
                  title="Export to CSV"
                >
                  <Download size={16} className="me-1" />
                  Export
                </Button>
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
                <Button size="sm" onClick={handleAddModalShow} style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}>
                  <Plus size={16} className="me-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Data Grid */}
          <div className="flex-grow-1 p-2 p-md-3" style={{ overflow: 'hidden' }}>
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <div className="table-responsive table-sticky-header">
                  <Table bordered hover className="mb-0">
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
                        <th style={{ width: "120px" }}>ACTIONS</th>
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
                            <td className="fw-semibold" style={{ color: '#FF5722' }}>
                              {shipment.orderNumber || "-"}
                            </td>
                            <td>{shipment.supplier}</td>
                            <td>{shipment.cro || "-"}</td>
                            <td>{shipment.container}</td>
                            <td>{shipment.mawbNumber || "-"}</td>
                            <td>{shipment.carrier}</td>
                            <td>
                              <Badge bg={getStatusVariant(shipment.status)}>{shipment.status}</Badge>
                            </td>
                            <td>{shipment.atd || "-"}</td>
                            <td>{shipment.eta}</td>
                            <td>{shipment.ata || "-"}</td>
                            <td>{shipment.pol}</td>
                            <td>{shipment.pod || "-"}</td>
                            <td>
                              <div className="d-flex gap-2 align-items-center">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 text-muted position-relative"
                                  title="Attachments"
                                  onClick={() => setAttachmentsModalShipment({ id: shipment.id, label: shipment.orderNumber || shipment.label })}
                                >
                                  <Paperclip size={16} />
                                  {attachmentCounts[shipment.id] > 0 && (
                                    <Badge 
                                      bg="primary" 
                                      pill 
                                      className="position-absolute"
                                      style={{ top: -8, right: -8, fontSize: '0.6rem', padding: '2px 5px' }}
                                    >
                                      {attachmentCounts[shipment.id]}
                                    </Badge>
                                  )}
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 text-muted position-relative"
                                  title="Comments"
                                  onClick={() => setCommentsModalShipment({ id: shipment.id, orderNumber: shipment.orderNumber })}
                                >
                                  <MessageSquare size={16} />
                                  {commentCounts[shipment.id] > 0 && (
                                    <Badge 
                                      pill
                                      className="position-absolute"
                                      style={{ backgroundColor: '#FF5722', top: -8, right: -8, fontSize: '0.6rem', padding: '2px 5px' }}
                                    >
                                      {commentCounts[shipment.id]}
                                    </Badge>
                                  )}
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 text-muted"
                                  title="Edit Shipment"
                                  onClick={() => handleEditShipment(shipment)}
                                >
                                  <Edit2 size={16} />
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
        </div>
      </div>

      {/* Add/Edit Shipment Modal */}
      <AddShipmentModal
        show={showAddModal}
        onHide={handleAddModalClose}
        editingShipment={editingShipment}
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
          <Button onClick={handleNotificationsClose} style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Comments Modal */}
      <CommentsModal
        show={commentsModalShipment !== null}
        onHide={() => setCommentsModalShipment(null)}
        shipmentId={commentsModalShipment?.id || ""}
        orderNumber={commentsModalShipment?.orderNumber || ""}
      />

      {/* Attachments Modal */}
      <AttachmentsModal
        show={attachmentsModalShipment !== null}
        onHide={() => setAttachmentsModalShipment(null)}
        shipmentId={attachmentsModalShipment?.id || ""}
        shipmentLabel={attachmentsModalShipment?.label || ""}
      />
    </div>
  );
}

export default App;
