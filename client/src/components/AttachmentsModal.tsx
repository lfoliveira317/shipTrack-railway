import React, { useState, useRef } from 'react';
import { Modal, Button, Form, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Paperclip, Upload, Trash2, FileText, Image, File, X, Eye, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

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
  s3Key: string | null;
  s3Url: string | null;
  uploadedBy: string;
  uploadedAt: Date;
  documentType?: string | null;
}

const AttachmentsModal: React.FC<AttachmentsModalProps> = ({
  show,
  onHide,
  shipmentId,
  shipmentLabel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [filterDocumentType, setFilterDocumentType] = useState<string>('all');
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils();
  
  const { data: attachments, isLoading } = trpc.attachments.byShipment.useQuery(
    { shipmentId },
    { enabled: show }
  );
  
  const { data: documentTypes } = trpc.dropdowns.documentTypes.list.useQuery(undefined, { enabled: show });
  
  const uploadAttachment = trpc.attachments.upload.useMutation({
    onSuccess: () => {
      utils.attachments.byShipment.invalidate({ shipmentId });
      utils.attachments.counts.invalidate();
      setSelectedFile(null);
      setSelectedDocumentType('');
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('File uploaded successfully!');
    },
    onError: (error) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast.error(`Upload failed: ${error.message}`);
    },
  });
  
  const getDownloadUrl = trpc.attachments.getDownloadUrl.useMutation({
    onError: (error) => {
      toast.error(`Failed to get download URL: ${error.message}`);
    },
  });
  
  const deleteAttachment = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      utils.attachments.byShipment.invalidate({ shipmentId });
      utils.attachments.counts.invalidate();
      toast.success('Attachment deleted');
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 50));
        }
      };
      
      reader.onload = async () => {
        setUploadProgress(60);
        const base64Data = (reader.result as string).split(',')[1]; // Remove data URL prefix
        
        setUploadProgress(70);
        
        // Upload to S3 via API
        await uploadAttachment.mutateAsync({
          shipmentId,
          filename: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type || 'application/octet-stream',
          fileData: base64Data,
          uploadedBy: 'Admin User',
          documentType: selectedDocumentType || null,
        });
        
        setUploadProgress(100);
      };
      
      reader.onerror = () => {
        setIsUploading(false);
        toast.error('Failed to read file');
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleDelete = (attachmentId: number) => {
    if (confirm('Are you sure you want to delete this attachment?')) {
      deleteAttachment.mutate({ attachmentId });
    }
  };
  
  const handlePreview = async (attachment: Attachment) => {
    setPreviewAttachment(attachment);
    
    if (attachment.s3Key) {
      try {
        const result = await getDownloadUrl.mutateAsync({ attachmentId: attachment.id });
        setPreviewUrl(result.url);
      } catch (error) {
        // Use placeholder if can't get URL
        if (attachment.fileType.startsWith('image/')) {
          setPreviewUrl(`https://via.placeholder.com/800x600.png?text=${encodeURIComponent(attachment.filename)}`);
        } else {
          setPreviewUrl('');
        }
      }
    } else {
      // No S3 key - use placeholder
      if (attachment.fileType.startsWith('image/')) {
        setPreviewUrl(`https://via.placeholder.com/800x600.png?text=${encodeURIComponent(attachment.filename)}`);
      } else {
        setPreviewUrl('');
      }
    }
  };
  
  const handleClosePreview = () => {
    setPreviewAttachment(null);
    setPreviewUrl('');
  };
  
  const handleDownload = async (attachment: Attachment) => {
    if (!attachment.s3Key) {
      toast.error('No file associated with this attachment');
      return;
    }
    
    try {
      const result = await getDownloadUrl.mutateAsync({ attachmentId: attachment.id });
      
      // Open download URL in new tab or trigger download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = attachment.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
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
  
  const hasS3File = (attachment: Attachment): boolean => {
    return !!attachment.s3Key;
  };
  
  // Preview Modal
  if (previewAttachment) {
    return (
      <Modal show={true} onHide={handleClosePreview} centered size="xl" fullscreen="lg-down">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Eye size={24} style={{ color: '#FF5722' }} />
            <span>{previewAttachment.filename}</span>
            {hasS3File(previewAttachment) && (
              <Badge bg="success" className="ms-2">
                <CheckCircle size={12} className="me-1" />
                Stored in Cloud
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4">
          {previewAttachment.fileType.startsWith('image/') && previewUrl ? (
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
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  title={previewAttachment.filename}
                  className="w-100 rounded"
                  style={{ height: '500px', border: 'none' }}
                />
              ) : (
                <>
                  <FileText size={64} className="text-muted mb-3" />
                  <h5>{previewAttachment.filename}</h5>
                  <p className="text-muted">PDF Preview</p>
                  <Button
                    style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}
                    onClick={() => handleDownload(previewAttachment)}
                    className="mt-3"
                    disabled={!hasS3File(previewAttachment)}
                  >
                    <Download size={18} className="me-2" />
                    Download PDF
                  </Button>
                </>
              )}
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
              <div className="col-12">
                <small className="text-muted d-block">Storage Status</small>
                {hasS3File(previewAttachment) ? (
                  <Badge bg="success">
                    <CheckCircle size={12} className="me-1" />
                    Stored in Cloud Storage
                  </Badge>
                ) : (
                  <Badge bg="warning" text="dark">
                    <AlertCircle size={12} className="me-1" />
                    Metadata Only
                  </Badge>
                )}
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
            disabled={!hasS3File(previewAttachment) || getDownloadUrl.isPending}
          >
            {getDownloadUrl.isPending ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : (
              <Download size={18} className="me-2" />
            )}
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
          <div className="mb-2">
            <Form.Select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              disabled={isUploading}
              className="mb-2"
            >
              <option value="">Select Document Type (Optional)</option>
              {documentTypes?.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </Form.Select>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="flex-grow-1"
              disabled={isUploading}
            />
            <Button
              style={{ backgroundColor: '#FF5722', borderColor: '#FF5722' }}
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="d-flex align-items-center gap-2"
            >
              {isUploading ? (
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
          {isUploading && (
            <div className="mt-2">
              <div className="progress" style={{ height: '8px' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${uploadProgress}%`, backgroundColor: '#FF5722' }}
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <small className="text-muted">Uploading... {uploadProgress}%</small>
            </div>
          )}
          <Alert variant="info" className="mt-3 mb-0 small">
            <strong>Note:</strong> Files are securely stored in cloud storage. Maximum file size: 10MB.
          </Alert>
        </div>
        
        {/* Attachments List */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">
            Uploaded Files
            {attachments && attachments.length > 0 && (
              <Badge bg="secondary" className="ms-2">{attachments.length}</Badge>
            )}
          </h6>
          <Form.Select
            size="sm"
            value={filterDocumentType}
            onChange={(e) => setFilterDocumentType(e.target.value)}
            style={{ width: 'auto', minWidth: '180px' }}
          >
            <option value="all">All Document Types</option>
            {documentTypes?.map((docType) => (
              <option key={docType.id} value={docType.name}>
                {docType.name}
              </option>
            ))}
          </Form.Select>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" style={{ color: '#FF5722' }} />
          </div>
        ) : attachments && attachments.length > 0 ? (
          <ListGroup variant="flush">
            {attachments
              .filter(attachment => filterDocumentType === 'all' || attachment.documentType === filterDocumentType)
              .map((attachment) => (
              <ListGroup.Item
                key={attachment.id}
                className="d-flex justify-content-between align-items-center py-3"
              >
                <div className="d-flex align-items-center gap-3">
                  {getFileIcon(attachment.fileType)}
                  <div>
                    <div className="fw-medium d-flex align-items-center gap-2">
                      {attachment.filename}
                      {hasS3File(attachment) ? (
                        <Badge bg="success" className="small">
                          <CheckCircle size={10} className="me-1" />
                          Cloud
                        </Badge>
                      ) : (
                        <Badge bg="warning" text="dark" className="small">
                          Metadata
                        </Badge>
                      )}
                    </div>
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
                    disabled={!hasS3File(attachment) || getDownloadUrl.isPending}
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
