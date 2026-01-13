import { useState } from "react";
import { Modal, Button, Form, ListGroup, Badge, Spinner } from "react-bootstrap";
import { MessageCircle, Send, Trash2, User } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CommentsModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: string;
  orderNumber: string;
}

export function CommentsModal({ show, onHide, shipmentId, orderNumber }: CommentsModalProps) {
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("Admin User");

  const utils = trpc.useUtils();

  // Fetch comments for this shipment
  const { data: comments, isLoading } = trpc.comments.byShipment.useQuery(
    { shipmentId },
    { enabled: show }
  );

  // Add comment mutation
  const addCommentMutation = trpc.comments.add.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.comments.byShipment.invalidate({ shipmentId });
      utils.comments.counts.invalidate();
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.byShipment.invalidate({ shipmentId });
      utils.comments.counts.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate({
        shipmentId,
        author: authorName,
        text: newComment.trim(),
      });
    }
  };

  const handleDelete = (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate({ commentId });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <MessageCircle size={24} className="text-primary" />
          <span>Comments for {orderNumber}</span>
          {comments && comments.length > 0 && (
            <Badge bg="secondary" pill>
              {comments.length}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Add Comment Form */}
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label className="small text-muted">Your Name</Form.Label>
            <Form.Control
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter your name"
              size="sm"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small text-muted">Add a Comment</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                as="textarea"
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                disabled={addCommentMutation.isPending}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!newComment.trim() || addCommentMutation.isPending}
                style={{ height: "fit-content", alignSelf: "flex-end" }}
              >
                {addCommentMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
          </Form.Group>
        </Form>

        {/* Comments List */}
        <div className="border-top pt-3">
          <h6 className="text-muted mb-3">
            {isLoading ? "Loading comments..." : `${comments?.length || 0} Comments`}
          </h6>

          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : comments && comments.length > 0 ? (
            <ListGroup variant="flush">
              {comments.map((comment) => (
                <ListGroup.Item
                  key={comment.id}
                  className="px-0 py-3 border-bottom"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-3 flex-grow-1">
                      <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 40, height: 40 }}
                      >
                        <User size={20} className="text-white" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <strong className="text-dark">{comment.author}</strong>
                          <small className="text-muted">
                            {formatDate(comment.createdAt)}
                          </small>
                        </div>
                        <p className="mb-0 text-secondary">{comment.text}</p>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center py-4 text-muted">
              <MessageCircle size={48} className="mb-2 opacity-50" />
              <p className="mb-0">No comments yet. Be the first to add one!</p>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
