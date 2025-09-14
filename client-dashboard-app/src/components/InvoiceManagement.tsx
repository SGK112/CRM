import React, { useState, useEffect } from 'react';
import { Client, Invoice } from '../types';
import apiService from '../services/ApiService';

interface InvoiceManagementProps {
    selectedClient: Client | null;
    onClientSelect: (client: Client) => void;
}

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ 
    selectedClient, 
    onClientSelect 
}) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const data = await apiService.getInvoices();
            setInvoices(data);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await apiService.updateInvoice(id, { status: status as any });
            loadInvoices();
        } catch (error) {
            console.error('Error updating invoice:', error);
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            invoice.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            invoice.client?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
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
            case 'viewed': return '#17a2b8';
            case 'paid': return '#28a745';
            case 'overdue': return '#dc3545';
            case 'cancelled': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const calculateOverdueDays = (dueDate?: Date) => {
        if (!dueDate) return 0;
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <div className="invoice-management">
            <div className="header-section">
                <h2>Invoice Management</h2>
                <button className="btn btn-primary">
                    + Create Invoice
                </button>
            </div>

            <div className="filters-section">
                <input
                    type="text"
                    placeholder="Search invoices..."
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
                    <option value="viewed">Viewed</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <h3>{formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.total, 0))}</h3>
                    <p>Total Outstanding</p>
                </div>
                <div className="summary-card">
                    <h3>{formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0))}</h3>
                    <p>Total Paid</p>
                </div>
                <div className="summary-card">
                    <h3>{filteredInvoices.filter(inv => inv.status === 'overdue').length}</h3>
                    <p>Overdue Invoices</p>
                </div>
                <div className="summary-card">
                    <h3>{filteredInvoices.filter(inv => inv.status === 'paid').length}</h3>
                    <p>Paid Invoices</p>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading invoices...</div>
            ) : (
                <div className="invoices-table-container">
                    <table className="invoices-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Client</th>
                                <th>Amount</th>
                                <th>Paid</th>
                                <th>Status</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map(invoice => {
                                const overdueDays = calculateOverdueDays(invoice.dueDate);
                                return (
                                    <tr key={invoice._id} className={invoice.status === 'overdue' ? 'overdue-row' : ''}>
                                        <td>
                                            <div className="invoice-number">
                                                <strong>{invoice.invoiceNumber}</strong>
                                                <div className="invoice-title">{invoice.title}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="client-info">
                                                <strong>
                                                    {invoice.client?.firstName} {invoice.client?.lastName}
                                                </strong>
                                                {invoice.client?.companyName && (
                                                    <div className="company-name">{invoice.client.companyName}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{formatCurrency(invoice.total)}</strong>
                                        </td>
                                        <td>
                                            <div className="payment-info">
                                                <span>{formatCurrency(invoice.paidAmount)}</span>
                                                {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                                                    <div className="partial-payment">
                                                        Partial: {formatCurrency(invoice.total - invoice.paidAmount)} remaining
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(invoice.status) }}
                                            >
                                                {invoice.status}
                                            </span>
                                            {invoice.status === 'overdue' && overdueDays > 0 && (
                                                <div className="overdue-info">
                                                    {overdueDays} days overdue
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {invoice.dueDate ? (
                                                <span className={overdueDays > 0 ? 'overdue-date' : ''}>
                                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="no-due-date">No due date</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {invoice.status === 'draft' && (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleStatusUpdate(invoice._id, 'sent')}
                                                    >
                                                        Send
                                                    </button>
                                                )}
                                                {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleStatusUpdate(invoice._id, 'paid')}
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                <button className="btn btn-sm btn-outline">
                                                    View
                                                </button>
                                                <button className="btn btn-sm btn-outline">
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredInvoices.length === 0 && (
                        <div className="no-invoices">
                            <p>No invoices found</p>
                            <button className="btn btn-primary">
                                Create your first invoice
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .invoice-management {
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

                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .summary-card {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .summary-card h3 {
                    margin: 0 0 8px 0;
                    color: #333;
                    font-size: 1.5rem;
                }

                .summary-card p {
                    margin: 0;
                    color: #666;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .invoices-table-container {
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .invoices-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .invoices-table th {
                    background-color: #f8f9fa;
                    padding: 15px 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #333;
                    border-bottom: 1px solid #e9ecef;
                    font-size: 0.9rem;
                }

                .invoices-table td {
                    padding: 15px 12px;
                    border-bottom: 1px solid #f1f1f1;
                    vertical-align: top;
                }

                .invoices-table tr:hover {
                    background-color: #f8f9fa;
                }

                .overdue-row {
                    background-color: #fff5f5;
                }

                .overdue-row:hover {
                    background-color: #fed7d7;
                }

                .invoice-number strong {
                    color: #333;
                    font-size: 0.95rem;
                }

                .invoice-title {
                    color: #666;
                    font-size: 0.85rem;
                    margin-top: 2px;
                }

                .client-info strong {
                    color: #333;
                    display: block;
                }

                .company-name {
                    color: #666;
                    font-size: 0.85rem;
                    margin-top: 2px;
                }

                .payment-info {
                    color: #333;
                }

                .partial-payment {
                    color: #856404;
                    font-size: 0.8rem;
                    margin-top: 2px;
                }

                .status-badge {
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-transform: capitalize;
                    display: inline-block;
                }

                .overdue-info {
                    color: #dc3545;
                    font-size: 0.8rem;
                    margin-top: 4px;
                    font-weight: 500;
                }

                .overdue-date {
                    color: #dc3545;
                    font-weight: 500;
                }

                .no-due-date {
                    color: #999;
                    font-style: italic;
                }

                .action-buttons {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .no-invoices {
                    text-align: center;
                    padding: 60px 20px;
                    color: #666;
                }

                .no-invoices p {
                    margin-bottom: 20px;
                    font-size: 1.1rem;
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
                    white-space: nowrap;
                }

                .btn-primary {
                    background-color: #007bff;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #0056b3;
                }

                .btn-success {
                    background-color: #28a745;
                    color: white;
                }

                .btn-success:hover {
                    background-color: #218838;
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

                    .summary-cards {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .invoices-table-container {
                        overflow-x: auto;
                    }

                    .invoices-table {
                        min-width: 800px;
                    }

                    .action-buttons {
                        flex-direction: column;
                        gap: 4px;
                    }
                }

                @media (max-width: 480px) {
                    .summary-cards {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceManagement;