import React, { useState, useEffect } from 'react';
import { Client, CreateClientRequest, UpdateClientRequest } from '../types';
import apiService from '../services/ApiService';

interface ClientManagementProps {
  onClientSelect?: (client: Client) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ onClientSelect }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateClientRequest>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    contactType: 'individual',
    status: 'active',
    notes: '',
  });

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, [currentPage, searchTerm]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getClients(currentPage, 10, searchTerm);
      setClients(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clients');
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('First name, last name, and email are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newClient = await apiService.createClient(formData as CreateClientRequest);
      setClients(prev => [newClient, ...prev]);
      setIsCreating(false);
      resetForm();
      alert('Client created successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create client');
      console.error('Error creating client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      setLoading(true);
      setError(null);
      const updatedClient = await apiService.updateClient(
        selectedClient._id,
        formData as UpdateClientRequest
      );
      setClients(prev =>
        prev.map(client =>
          client._id === selectedClient._id ? updatedClient : client
        )
      );
      setIsEditing(false);
      setSelectedClient(updatedClient);
      resetForm();
      alert('Client updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update client');
      console.error('Error updating client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      setLoading(true);
      setError(null);
      await apiService.deleteClient(clientId);
      setClients(prev => prev.filter(client => client._id !== clientId));
      if (selectedClient?._id === clientId) {
        setSelectedClient(null);
      }
      alert('Client deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete client');
      console.error('Error deleting client:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone || '',
      companyName: client.companyName || '',
      contactType: client.contactType,
      status: client.status,
      notes: client.notes || '',
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      contactType: 'individual',
      status: 'active',
      notes: '',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="client-management">
      <div className="client-management-header">
        <h2>Client Management</h2>
        <div className="actions">
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary"
            disabled={loading}
          >
            + Add Client
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
          {error}
        </div>
      )}

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="client-management-content">
        {/* Client List */}
        <div className="client-list">
          <h3>Clients ({clients.length})</h3>
          {loading && <div>Loading clients...</div>}
          {clients.length === 0 && !loading && (
            <div>No clients found. Create your first client!</div>
          )}
          <div className="client-cards">
            {clients.map(client => (
              <div
                key={client._id}
                className={`client-card ${selectedClient?._id === client._id ? 'selected' : ''}`}
                onClick={() => handleSelectClient(client)}
              >
                <div className="client-info">
                  <h4>{client.firstName} {client.lastName}</h4>
                  {client.companyName && <p className="company">{client.companyName}</p>}
                  <p className="email">{client.email}</p>
                  {client.phone && <p className="phone">{client.phone}</p>}
                  <span className={`status ${client.status}`}>{client.status}</span>
                </div>
                <div className="client-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClient(client);
                    }}
                    className="btn btn-sm btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClient(client._id);
                    }}
                    className="btn btn-sm btn-danger"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-sm"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Client Details */}
        {selectedClient && !isEditing && (
          <div className="client-details">
            <h3>Client Details</h3>
            <div className="details-content">
              <p><strong>Name:</strong> {selectedClient.firstName} {selectedClient.lastName}</p>
              <p><strong>Email:</strong> {selectedClient.email}</p>
              {selectedClient.phone && <p><strong>Phone:</strong> {selectedClient.phone}</p>}
              {selectedClient.companyName && <p><strong>Company:</strong> {selectedClient.companyName}</p>}
              <p><strong>Type:</strong> {selectedClient.contactType}</p>
              <p><strong>Status:</strong> {selectedClient.status}</p>
              {selectedClient.notes && <p><strong>Notes:</strong> {selectedClient.notes}</p>}
              <p><strong>Created:</strong> {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || isEditing) && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{isCreating ? 'Create New Client' : 'Edit Client'}</h3>
            <form onSubmit={isCreating ? handleCreateClient : handleUpdateClient}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Type</label>
                  <select
                    name="contactType"
                    value={formData.contactType || 'individual'}
                    onChange={handleInputChange}
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isCreating ? 'Create Client' : 'Update Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .client-management {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .client-management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .search-section {
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .client-management-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .client-management-content {
            grid-template-columns: 1fr;
          }
        }

        .client-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .client-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .client-card:hover {
          border-color: #007bff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .client-card.selected {
          border-color: #007bff;
          background-color: #f8f9fa;
        }

        .client-info h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .client-info p {
          margin: 2px 0;
          color: #666;
          font-size: 14px;
        }

        .status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status.active {
          background-color: #d4edda;
          color: #155724;
        }

        .status.inactive {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status.prospect {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        .client-actions {
          display: flex;
          gap: 8px;
        }

        .client-details {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background-color: #f8f9fa;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background-color: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background-color: #0056b3;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #545b62;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background-color: #c82333;
        }

        .btn-sm {
          padding: 4px 8px;
          font-size: 12px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
        }

        .error-message {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ClientManagement;