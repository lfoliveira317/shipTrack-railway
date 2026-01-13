import React, { useState, useRef } from 'react';
import { Modal, Button, Form, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Paperclip, Upload, Trash2, FileText, Image, File, X, Eye, Download } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface AttachmentsModalProps {
  show: boolean;
  onHide: () => void;
  shipmentId: number;
  shipmentLabel: string;
}

interface Attachment {
  id: number;
  filename: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

const AttachmentsModal: React.FC<AttachmentsModalProps> = ({
  show,
  onHide,
  shipmentId,
  shipmentLabel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
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
      filename: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type || 'application/octet-stream',
      uploadedBy: 'Admin User',
    });
  };
  
  const handleDelete = (attachmentId: number) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      deleteAttachment.mutate({ attachmentId });
    }
  };
  
  const handlePreview = (attachment: Attachment) => {
    setPreviewAttachment(attachment);
    
    // Generate a mock preview URL (in real implementation, this would fetch from server/S3)
    // For demonstration, we'll create a placeholder based on file type
    if (attachment.fileType.startsWith('image/')) {
      // Mock image URL - in production, this would be the actual file URL
      setPreviewUrl(`https://via.placeholder.com/800x600.png?text=${encodeURIComponent(attachment.filename)}`);
    } else if (attachment.fileType.includes('pdf')) {
      // Mock PDF preview
      setPreviewUrl('about:blank'); // In production, use actual PDF URL
    } else {
      setPreviewUrl('');
    }
  };
  
  const handleClosePreview = () => {
    setPreviewAttachment(null);
    setPreviewUrl('');
  };
  
  const handleDownload = (attachment: Attachment) => {
    // Mock download - in production, this would download from server/S3
    alert(`Downloading: ${attachment.filename}\n\nIn production, this would download the actual file from storage.`);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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
  
  const isPreviewable = (fileType: string): boolean => {
    return fileType.startsWith('image/') || fileType.includes('pdf');
  };
  
  // Preview Modal
  if (previewAttachment) {
    return (
      <Modal show={true} onHide={handleClosePreview} centered size="xl" fullscreen="lg-down">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Eye size={24} style={{ color: '#FF5722' }} />
            <span>{previewAttachment.filename}</span>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4">
          {previewAttachment.fileType.startsWith('image/') ? (
            <div className="text-center">
              <img
                src={previewUrl}
                alt={previewAttachment.filename}
                className="img-fluid rounded"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
            </div>
          ) : previewAttachment.fileType.includes('pdf') ? (
            <div className="border rounded p-4 text-center bg-light" style={{ minHeight: '400px' }}>
              <FileText size={64} className="text-muted mb-3" />
              <h5>{previewAttachment.filename}</h5>
              <p className="text-muted">PDF Preview</p>
              <p className="small text-muted">
                In production, this would display an embedded PDF viewer.
                <br />
                For now, use the download button to view the file.
              </p>
              <Button
                style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}
                onClick={() => handleDownload(previewAttachment)}
                className="mt-3"
              >
                <Download size={18} className="me-2" />
                Download PDF
              </Button>
            </div>
          ) : (
            <div className="text-center py-5">
              <File size={64} className="text-muted mb-3" />
              <p className="text-muted">Preview not available for this file type</p>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-light rounded">
            <div className="row g-3">
              <div className="col-md-6">
                <small className="text-muted d-block">File Size</small>
                <strong>{formatFileSize(previewAttachment.fileSize)}</strong>
              </div>
              <div className="col-md-6">
                <small className="text-muted d-block">Uploaded By</small>
                <strong>{previewAttachment.uploadedBy}</strong>
              </div>
              <div className="col-md-6">
                <small className="text-muted d-block">Upload Date</small>
                <strong>{formatDate(previewAttachment.uploadedAt)}</strong>
              </div>
              <div className="col-md-6">
                <small className="text-muted d-block">File Type</small>
                <strong>{previewAttachment.fileType}</strong>
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={handleClosePreview}>
            Close Preview
          </Button>
          <Button
            style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}
            onClick={() => handleDownload(previewAttachment)}
          >
            <Download size={18} className="me-2" />
            Download
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
  
  // Main Attachments Modal
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <Paperclip size={24} style={{ color: '#FF5722' }} />
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
              style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}
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
            <Spinner animation="border" style={{ color: '#FF5722' }} />
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
                    <div className="fw-medium">{attachment.filename}</div>
                    <small className="text-muted">
                      {formatFileSize(attachment.fileSize)} • Uploaded by {attachment.uploadedBy} • {formatDate(attachment.uploadedAt)}
                    </small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {isPreviewable(attachment.fileType) && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handlePreview(attachment)}
                      title="Preview"
                    >
                      <Eye size={16} />
                    </Button>
                  )}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    title="Download"
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                    disabled={deleteAttachment.isPending}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
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
