import { useState } from "react";
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge, Modal, Spinner } from "react-bootstrap";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function DropdownManagement() {
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddCarrier, setShowAddCarrier] = useState(false);
  const [showAddPort, setShowAddPort] = useState(false);

  const [newSupplier, setNewSupplier] = useState("");
  const [newCarrier, setNewCarrier] = useState("");
  const [newPort, setNewPort] = useState<{ name: string; code: string; type: "loading" | "discharge" }>({
    name: "",
    code: "",
    type: "loading",
  });

  const utils = trpc.useUtils();

  // Suppliers
  const { data: suppliers, isLoading: loadingSuppliers } = trpc.dropdowns.suppliers.list.useQuery();
  const addSupplierMutation = trpc.dropdowns.suppliers.add.useMutation({
    onSuccess: () => {
      toast.success("Supplier added successfully");
      setNewSupplier("");
      setShowAddSupplier(false);
      utils.dropdowns.suppliers.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add supplier");
    },
  });

  const deleteSupplierMutation = trpc.dropdowns.suppliers.delete.useMutation({
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      utils.dropdowns.suppliers.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete supplier");
    },
  });

  // Carriers
  const { data: carriers, isLoading: loadingCarriers } = trpc.dropdowns.carriers.list.useQuery();
  const addCarrierMutation = trpc.dropdowns.carriers.add.useMutation({
    onSuccess: () => {
      toast.success("Carrier added successfully");
      setNewCarrier("");
      setShowAddCarrier(false);
      utils.dropdowns.carriers.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add carrier");
    },
  });

  const deleteCarrierMutation = trpc.dropdowns.carriers.delete.useMutation({
    onSuccess: () => {
      toast.success("Carrier deleted successfully");
      utils.dropdowns.carriers.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete carrier");
    },
  });

  // Ports
  const { data: ports, isLoading: loadingPorts } = trpc.dropdowns.ports.list.useQuery();
  const addPortMutation = trpc.dropdowns.ports.add.useMutation({
    onSuccess: () => {
      toast.success("Port added successfully");
      setNewPort({ name: "", code: "", type: "loading" });
      setShowAddPort(false);
      utils.dropdowns.ports.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add port");
    },
  });

  const deletePortMutation = trpc.dropdowns.ports.delete.useMutation({
    onSuccess: () => {
      toast.success("Port deleted successfully");
      utils.dropdowns.ports.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete port");
    },
  });

  const handleAddSupplier = () => {
    if (!newSupplier.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }
    addSupplierMutation.mutate({ name: newSupplier });
  };

  const handleAddCarrier = () => {
    if (!newCarrier.trim()) {
      toast.error("Please enter a carrier name");
      return;
    }
    addCarrierMutation.mutate({ name: newCarrier });
  };

  const handleAddPort = () => {
    if (!newPort.name.trim()) {
      toast.error("Please enter a port name");
      return;
    }
    addPortMutation.mutate({
      name: newPort.name,
      code: newPort.code || undefined,
      type: newPort.type,
    });
  };

  return (
    <div className="d-flex flex-column h-100" style={{ overflow: 'hidden' }}>
      <div className="p-3 border-bottom bg-white">
        <h2 className="mb-2 fw-bold">Dropdown Management</h2>
        <p className="text-muted mb-0">Manage dropdown values for Suppliers, Carriers, and Ports</p>
      </div>

      <div className="flex-grow-1" style={{ overflow: 'auto' }}>
        <Container fluid className="py-4">
          <Row className="g-4">
        {/* Suppliers */}
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <span>Suppliers</span>
                <Badge bg="secondary">{suppliers?.length || 0}</Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {loadingSuppliers ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <>
                  <ListGroup variant="flush" className="mb-3">
                    {suppliers && suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <ListGroup.Item key={supplier.id} className="d-flex justify-content-between align-items-center">
                          <span>{supplier.name}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteSupplierMutation.mutate({ id: supplier.id })}
                            disabled={deleteSupplierMutation.isPending}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <p className="text-muted text-center py-3">No suppliers added yet</p>
                    )}
                  </ListGroup>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-100"
                    onClick={() => setShowAddSupplier(true)}
                  >
                    <Plus size={16} className="me-2" />
                    Add Supplier
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Carriers */}
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <span>Carriers</span>
                <Badge bg="secondary">{carriers?.length || 0}</Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {loadingCarriers ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <>
                  <ListGroup variant="flush" className="mb-3">
                    {carriers && carriers.length > 0 ? (
                      carriers.map((carrier) => (
                        <ListGroup.Item key={carrier.id} className="d-flex justify-content-between align-items-center">
                          <span>{carrier.name}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteCarrierMutation.mutate({ id: carrier.id })}
                            disabled={deleteCarrierMutation.isPending}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <p className="text-muted text-center py-3">No carriers added yet</p>
                    )}
                  </ListGroup>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-100"
                    onClick={() => setShowAddCarrier(true)}
                  >
                    <Plus size={16} className="me-2" />
                    Add Carrier
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Ports */}
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <span>Ports</span>
                <Badge bg="secondary">{ports?.length || 0}</Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {loadingPorts ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <>
                  <ListGroup variant="flush" className="mb-3">
                    {ports && ports.length > 0 ? (
                      ports.map((port) => (
                        <ListGroup.Item key={port.id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <div>{port.name}</div>
                            <small className="text-muted">
                              {port.code && `${port.code} • `}
                              {port.type === "loading" ? "POL" : "POD"}
                            </small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deletePortMutation.mutate({ id: port.id })}
                            disabled={deletePortMutation.isPending}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <p className="text-muted text-center py-3">No ports added yet</p>
                    )}
                  </ListGroup>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-100"
                    onClick={() => setShowAddPort(true)}
                  >
                    <Plus size={16} className="me-2" />
                    Add Port
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
          </Row>
        </Container>
      </div>

      {/* Add Supplier Modal */}
      <Modal show={showAddSupplier} onHide={() => setShowAddSupplier(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Supplier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Supplier Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter supplier name"
              value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddSupplier(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddSupplier}
            disabled={addSupplierMutation.isPending}
          >
            {addSupplierMutation.isPending ? "Adding..." : "Add Supplier"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Carrier Modal */}
      <Modal show={showAddCarrier} onHide={() => setShowAddCarrier(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Carrier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Carrier Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter carrier name"
              value={newCarrier}
              onChange={(e) => setNewCarrier(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCarrier(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddCarrier}
            disabled={addCarrierMutation.isPending}
          >
            {addCarrierMutation.isPending ? "Adding..." : "Add Carrier"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Port Modal */}
      <Modal show={showAddPort} onHide={() => setShowAddPort(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Port</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Port Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter port name (e.g., Singapore, Los Angeles)"
              value={newPort.name}
              onChange={(e) => setNewPort({ ...newPort, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Port Code (Optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter port code (e.g., SG, LA)"
              value={newPort.code}
              onChange={(e) => setNewPort({ ...newPort, code: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Port Type</Form.Label>
            <Form.Select
              value={newPort.type}
              onChange={(e) => {
                const value = e.target.value as "loading" | "discharge";
                setNewPort({ ...newPort, type: value });
              }}
            >
              <option value="loading">Port of Loading (POL)</option>
              <option value="discharge">Port of Discharge (POD)</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddPort(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddPort}
            disabled={addPortMutation.isPending}
          >
            {addPortMutation.isPending ? "Adding..." : "Add Port"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
