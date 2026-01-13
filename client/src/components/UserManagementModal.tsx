import React, { useState } from 'react';
import { Modal, Button, Table, Badge, Form, Spinner, Alert } from 'react-bootstrap';
import { Users, Shield, Eye, User, Edit2, Trash2, Save, X, UserPlus } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface UserManagementModalProps {
  show: boolean;
  onHide: () => void;
}

interface UserData {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: 'viewer' | 'user' | 'admin';
  loginMethod: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  show,
  onHide,
}) => {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    role: 'viewer' | 'user' | 'admin';
  }>({ name: '', email: '', role: 'viewer' });
  
  const utils = trpc.useUtils();
  
  const { data: users, isLoading } = trpc.users.list.useQuery(undefined, {
    enabled: show,
  });
  
  const { data: stats } = trpc.users.stats.useQuery(undefined, {
    enabled: show,
  });
  
  const { data: currentUser } = trpc.users.me.useQuery();
  
  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.stats.invalidate();
      setEditingUserId(null);
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
  
  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.users.stats.invalidate();
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
  
  const handleEdit = (user: UserData) => {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role,
    });
  };
  
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditForm({ name: '', email: '', role: 'viewer' });
  };
  
  const handleSaveEdit = () => {
    if (!editingUserId) return;
    
    updateUser.mutate({
      userId: editingUserId,
      data: {
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        role: editForm.role,
      },
    });
  };
  
  const handleDelete = (userId: number, userName: string | null) => {
    if (confirm(`Are you sure you want to delete user "${userName || 'Unknown'}"? This action cannot be undone.`)) {
      deleteUser.mutate({ userId });
    }
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger"><Shield size={12} className="me-1" />Admin</Badge>;
      case 'user':
        return <Badge bg="primary"><User size={12} className="me-1" />User</Badge>;
      case 'viewer':
        return <Badge bg="secondary"><Eye size={12} className="me-1" />Viewer</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };
  
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const isCurrentUser = (userId: number) => {
    return currentUser?.id === userId;
  };
  
  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <Users size={24} style={{ color: '#FF5722' }} />
          <span>User Management</span>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Stats Section */}
        {stats && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="p-3 bg-light rounded text-center">
                <div className="h4 mb-0" style={{ color: '#FF5722' }}>{stats.total}</div>
                <small className="text-muted">Total Users</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded text-center">
                <div className="h4 mb-0 text-danger">{stats.admins}</div>
                <small className="text-muted">Admins</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded text-center">
                <div className="h4 mb-0 text-primary">{stats.users}</div>
                <small className="text-muted">Users</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded text-center">
                <div className="h4 mb-0 text-secondary">{stats.viewers}</div>
                <small className="text-muted">Viewers</small>
              </div>
            </div>
          </div>
        )}
        
        {/* Role Legend */}
        <Alert variant="info" className="mb-4">
          <strong>Role Permissions:</strong>
          <ul className="mb-0 mt-2">
            <li><strong>Admin:</strong> Full access - can view, add, edit, delete shipments and manage users</li>
            <li><strong>User:</strong> Standard access - can view, add, edit, delete shipments</li>
            <li><strong>Viewer:</strong> Read-only access - can only view shipments and data</li>
          </ul>
        </Alert>
        
        {/* Users Table */}
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: '#FF5722' }} />
            <p className="mt-2 text-muted">Loading users...</p>
          </div>
        ) : users && users.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Login Method</th>
                  <th>Last Sign In</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {editingUserId === user.id ? (
                        <Form.Control
                          type="text"
                          size="sm"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Enter name"
                        />
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: 32,
                              height: 32,
                              backgroundColor: '#FF5722',
                              fontSize: '14px',
                            }}
                          >
                            {(user.name || 'U')[0].toUpperCase()}
                          </div>
                          <span>{user.name || 'Unknown'}</span>
                          {isCurrentUser(user.id) && (
                            <Badge bg="info" className="ms-1">You</Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingUserId === user.id ? (
                        <Form.Control
                          type="email"
                          size="sm"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="Enter email"
                        />
                      ) : (
                        user.email || '-'
                      )}
                    </td>
                    <td>
                      {editingUserId === user.id ? (
                        <Form.Select
                          size="sm"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'viewer' | 'user' | 'admin' })}
                          disabled={isCurrentUser(user.id)}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </Form.Select>
                      ) : (
                        getRoleBadge(user.role)
                      )}
                    </td>
                    <td>
                      <small className="text-muted">{user.loginMethod || 'OAuth'}</small>
                    </td>
                    <td>
                      <small className="text-muted">{formatDate(user.lastSignedIn)}</small>
                    </td>
                    <td>
                      {editingUserId === user.id ? (
                        <div className="d-flex gap-1">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateUser.isPending}
                          >
                            {updateUser.isPending ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              <Save size={14} />
                            )}
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="Edit user"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={isCurrentUser(user.id) || deleteUser.isPending}
                            title={isCurrentUser(user.id) ? "Cannot delete yourself" : "Delete user"}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <Users size={48} className="mb-2 opacity-50" />
            <p className="mb-0">No users found</p>
          </div>
        )}
        
        <Alert variant="secondary" className="mt-3 mb-0">
          <small>
            <strong>Note:</strong> Users are automatically created when they log in via OAuth. 
            You can only edit existing users' roles and details. New users will default to the "Viewer" role.
          </small>
        </Alert>
      </Modal.Body>
      
      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserManagementModal;
