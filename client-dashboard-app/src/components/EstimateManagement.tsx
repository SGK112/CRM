import React, { useState, useEffect } from 'react';
import { Client, Estimate, CreateEstimateRequest } from '../types';
import apiService from '../services/ApiService';

interface EstimateManagementProps {
    selectedClient: Client | null;
    onClientSelect: (client: Client) => void;
}

const EstimateManagement: React.FC<EstimateManagementProps> = ({ 
    selectedClient, 
    onClientSelect 
}) => {
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Form state
    const [formData, setFormData] = useState<CreateEstimateRequest>({
        clientId: '',
        title: '',
        description: '',
        items: [],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    useEffect(() => {
        loadEstimates();
        loadClients();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            setFormData(prev => ({ ...prev, clientId: selectedClient.id }));
        }
    }, [selectedClient]);

    const loadEstimates = async () => {
        setLoading(true);
        try {
            const data = await apiService.getEstimates();
            setEstimates(data);
        } catch (error) {
            console.error('Error loading estimates:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadClients = async () => {
        try {
            const data = await apiService.getClients();
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const handleCreateEstimate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.createEstimate(formData);
            setShowCreateForm(false);
            resetForm();
            loadEstimates();
        } catch (error) {
            console.error('Error creating estimate:', error);
        }
    };

    const handleUpdateEstimate = async (id: string, updates: Partial<Estimate>) => {
        try {
            await apiService.updateEstimate(id, updates);
            setEditingEstimate(null);
            loadEstimates();
        } catch (error) {
            console.error('Error updating estimate:', error);
        }
    };

    const handleDeleteEstimate = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this estimate?')) {
            try {
                await apiService.deleteEstimate(id);
                loadEstimates();
            } catch (error) {
                console.error('Error deleting estimate:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            clientId: selectedClient?.id || '',
            title: '',
            description: '',
            items: [],
            totalAmount: 0,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
    };

    const addEstimateItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        }));
    };

    const updateEstimateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        if (field === 'quantity' || field === 'rate') {
            newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        }

        const totalAmount = newItems.reduce((sum, item) => sum + item.amount, 0);
        
        setFormData(prev => ({
            ...prev,
            items: newItems,
            totalAmount
        }));
    };

    const removeEstimateItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        const totalAmount = newItems.reduce((sum, item) => sum + item.amount, 0);
        
        setFormData(prev => ({
            ...prev,
            items: newItems,
            totalAmount
        }));
    };

    const filteredEstimates = estimates.filter(estimate => {
        const matchesSearch = estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            estimate.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return '#6c757d';
            case 'sent': return '#007bff';
            case 'accepted': return '#28a745';
            case 'rejected': return '#dc3545';
            default: return '#6c757d';
        }
    };

    return (
        <div className="estimate-management">
            <div className="header-section">
                <h2>Estimate Management</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(true)}
                >
                    + Create Estimate
                </button>
            </div>

            <div className="filters-section">
                <input
                    type="text"
                    placeholder="Search estimates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading estimates...</div>
            ) : (
                <div className="estimates-grid">
                    {filteredEstimates.map(estimate => (
                        <div key={estimate.id} className="estimate-card">
                            <div className="estimate-header">
                                <h3>{estimate.title}</h3>
                                <span 
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(estimate.status) }}
                                >
                                    {estimate.status}
                                </span>
                            </div>
                            
                            <div className="estimate-details">
                                <p><strong>Client:</strong> {estimate.client?.name}</p>
                                <p><strong>Amount:</strong> {formatCurrency(estimate.totalAmount)}</p>
                                <p><strong>Valid Until:</strong> {new Date(estimate.validUntil).toLocaleDateString()}</p>
                                <p><strong>Created:</strong> {new Date(estimate.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="estimate-actions">
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => setEditingEstimate(estimate)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteEstimate(estimate.id)}
                                >
                                    Delete
                                </button>
                                {estimate.status === 'accepted' && (
                                    <button className="btn btn-sm btn-success">
                                        Convert to Invoice
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Create New Estimate</h3>
                            <button
                                className="close-button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateEstimate} className="estimate-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Client</label>
                                    <select
                                        value={formData.clientId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select Client</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Valid Until</label>
                                    <input
                                        type="date"
                                        value={formData.validUntil}
                                        onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    placeholder="Enter estimate title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter estimate description"
                                    rows={3}
                                />
                            </div>

                            <div className="items-section">
                                <div className="items-header">
                                    <h4>Estimate Items</h4>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline"
                                        onClick={addEstimateItem}
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                {formData.items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => updateEstimateItem(index, 'description', e.target.value)}
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => updateEstimateItem(index, 'quantity', parseFloat(e.target.value))}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Rate"
                                            value={item.rate}
                                            onChange={(e) => updateEstimateItem(index, 'rate', parseFloat(e.target.value))}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <div className="item-total">
                                            {formatCurrency(item.amount)}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => removeEstimateItem(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <div className="total-section">
                                    <strong>Total: {formatCurrency(formData.totalAmount)}</strong>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    Create Estimate
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .estimate-management {
                    padding: 20px 0;
                }

                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }

                .header-section h2 {
                    margin: 0;
                    color: #333;
                }

                .filters-section {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                }

                .search-input, .filter-select {
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .search-input {
                    flex: 1;
                    min-width: 200px;
                }

                .filter-select {
                    min-width: 150px;
                }

                .estimates-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                }

                .estimate-card {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: box-shadow 0.2s;
                }

                .estimate-card:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }

                .estimate-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }

                .estimate-header h3 {
                    margin: 0;
                    color: #333;
                    font-size: 1.1rem;
                }

                .status-badge {
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .estimate-details p {
                    margin: 8px 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                .estimate-actions {
                    margin-top: 15px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal {
                    background: white;
                    border-radius: 8px;
                    width: 100%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #e9ecef;
                }

                .modal-header h3 {
                    margin: 0;
                    color: #333;
                }

                .close-button {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .estimate-form {
                    padding: 20px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #333;
                    font-weight: 500;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    box-sizing: border-box;
                }

                .items-section {
                    margin: 20px 0;
                    border: 1px solid #e9ecef;
                    border-radius: 6px;
                    padding: 15px;
                }

                .items-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .items-header h4 {
                    margin: 0;
                    color: #333;
                }

                .item-row {
                    display: grid;
                    grid-template-columns: 2fr 80px 100px 100px auto;
                    gap: 10px;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .item-total {
                    font-weight: 500;
                    color: #333;
                    text-align: right;
                }

                .total-section {
                    text-align: right;
                    padding-top: 15px;
                    border-top: 1px solid #e9ecef;
                    margin-top: 15px;
                    font-size: 1.1rem;
                }

                .form-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e9ecef;
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background-color: #007bff;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #0056b3;
                }

                .btn-outline {
                    background: transparent;
                    border: 1px solid #6c757d;
                    color: #6c757d;
                }

                .btn-outline:hover {
                    background-color: #6c757d;
                    color: white;
                }

                .btn-danger {
                    background-color: #dc3545;
                    color: white;
                }

                .btn-danger:hover {
                    background-color: #c82333;
                }

                .btn-success {
                    background-color: #28a745;
                    color: white;
                }

                .btn-success:hover {
                    background-color: #218838;
                }

                .btn-sm {
                    padding: 6px 12px;
                    font-size: 12px;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }

                @media (max-width: 768px) {
                    .header-section {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }

                    .filters-section {
                        flex-direction: column;
                    }

                    .search-input, .filter-select {
                        width: 100%;
                    }

                    .estimates-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .item-row {
                        grid-template-columns: 1fr;
                        gap: 5px;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .modal {
                        margin: 10px;
                        max-width: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default EstimateManagement;