import React, { useState, useRef } from 'react';
import { Modal, Button, Form, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Paperclip, Upload, Trash2, FileText, Image, File, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface AttachmentsModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: string;
  shipmentLabel: string;
}

const AttachmentsModal: React.FC<AttachmentsModalProps> = ({
  show,
  onHide,
  shipmentId,
  shipmentLabel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils();
  
  const { data: attachments, isLoading } = trpc.attachments.byShipment.useQuery(
    { shipmentId },
    { enabled: show }
  );
  
  const addAttachment = trpc.attachments.add.useMutation({
    onSuccess: () => {
      utils.attachments.byShipment.invalidate({ shipmentId });
      utils.attachments.counts.invalidate();
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
  });
  
  const deleteAttachment = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      utils.attachments.byShipment.invalidate({ shipmentId });
      utils.attachments.counts.invalidate();
    },
  });
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  
  const handleUpload = () => {
    if (!selectedFile) return;
    
    addAttachment.mutate({
      shipmentId,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type || 'application/octet-stream',
      uploadedBy: 'Admin User',
    });
  };
  
  const handleDelete = (attachmentId: string) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      deleteAttachment.mutate({ attachmentId });
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image size={20} className="text-primary" />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText size={20} className="text-danger" />;
    }
    return <File size={20} className="text-secondary" />;
  };
  
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <Paperclip size={24} className="text-primary" />
          <span>Attachments for {shipmentLabel}</span>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Upload Section */}
        <div className="mb-4 p-3 bg-light rounded-3">
          <h6 className="mb-3">Upload New Attachment</h6>
          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="flex-grow-1"
            />
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile || addAttachment.isPending}
              className="d-flex align-items-center gap-2"
            >
              {addAttachment.isPending ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <Upload size={18} />
              )}
              Upload
            </Button>
          </div>
          {selectedFile && (
            <div className="mt-2 small text-muted">
              Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </div>
          )}
        </div>
        
        {/* Attachments List */}
        <h6 className="mb-3">
          Uploaded Files
          {attachments && attachments.length > 0 && (
            <Badge bg="secondary" className="ms-2">{attachments.length}</Badge>
          )}
        </h6>
        
        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : attachments && attachments.length > 0 ? (
          <ListGroup variant="flush">
            {attachments.map((attachment) => (
              <ListGroup.Item
                key={attachment.id}
                className="d-flex justify-content-between align-items-center py-3"
              >
                <div className="d-flex align-items-center gap-3">
                  {getFileIcon(attachment.fileType)}
                  <div>
                    <div className="fw-medium">{attachment.fileName}</div>
                    <small className="text-muted">
                      {formatFileSize(attachment.fileSize)} • Uploaded by {attachment.uploadedBy} • {formatDate(attachment.uploadedAt)}
                    </small>
                  </div>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deleteAttachment.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center py-4 text-muted">
            <Paperclip size={48} className="mb-2 opacity-50" />
            <p className="mb-0">No attachments yet</p>
            <small>Upload files to attach them to this shipment</small>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AttachmentsModal;
