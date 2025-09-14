import React, { useState, useEffect } from 'react';
import ClientManagement from '../components/ClientManagement';
import EstimateManagement from '../components/EstimateManagement';
import InvoiceManagement from '../components/InvoiceManagement';
import DashboardStats from '../components/DashboardStats';
import AuthModal from '../components/AuthModal';
import { Client, DashboardStats as StatsType } from '../types';
import apiService from '../services/ApiService';

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'estimates' | 'invoices'>('overview');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsType | null>(null);

    useEffect(() => {
        checkAuthentication();
    }, []);

    useEffect(() => {
        if (isAuthenticated && activeTab === 'overview') {
            loadDashboardStats();
        }
    }, [isAuthenticated, activeTab]);

    const checkAuthentication = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                // Try to make an authenticated request to verify token
                await apiService.healthCheck();
                setIsAuthenticated(true);
            }
        } catch (error) {
            // Token is invalid or expired
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const loadDashboardStats = async () => {
        try {
            const dashboardStats = await apiService.getDashboardStats();
            setStats(dashboardStats);
        } catch (error) {
            // Handle error silently or show notification
        }
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
        setActiveTab('overview');
        loadDashboardStats();
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setSelectedClient(null);
        setStats(null);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AuthModal onLogin={handleLogin} />;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>CRM Dashboard</h1>
                    <div className="header-actions">
                        <span>Welcome back!</span>
                        <button onClick={handleLogout} className="btn btn-outline">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <nav className="dashboard-nav">
                <button
                    className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`nav-button ${activeTab === 'clients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clients')}
                >
                    👥 Clients
                </button>
                <button
                    className={`nav-button ${activeTab === 'estimates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('estimates')}
                >
                    📋 Estimates
                </button>
                <button
                    className={`nav-button ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoices')}
                >
                    💰 Invoices
                </button>
            </nav>

            <main className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <h2>Dashboard Overview</h2>
                        {stats ? (
                            <DashboardStats stats={stats} />
                        ) : (
                            <div>Loading dashboard statistics...</div>
                        )}
                        
                        <div className="quick-actions-section">
                            <h3>Quick Actions</h3>
                            <div className="quick-actions-grid">
                                <button
                                    className="quick-action-card"
                                    onClick={() => setActiveTab('clients')}
                                >
                                    <span className="icon">👥</span>
                                    <span className="title">Manage Clients</span>
                                    <span className="description">Add, edit, or view client information</span>
                                </button>
                                <button
                                    className="quick-action-card"
                                    onClick={() => setActiveTab('estimates')}
                                >
                                    <span className="icon">📋</span>
                                    <span className="title">Create Estimate</span>
                                    <span className="description">Generate new estimates for clients</span>
                                </button>
                                <button
                                    className="quick-action-card"
                                    onClick={() => setActiveTab('invoices')}
                                >
                                    <span className="icon">💰</span>
                                    <span className="title">Manage Invoices</span>
                                    <span className="description">Track payments and billing</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'clients' && (
                    <ClientManagement
                        onClientSelect={(client) => setSelectedClient(client)}
                    />
                )}

                {activeTab === 'estimates' && (
                    <EstimateManagement
                        selectedClient={selectedClient}
                        onClientSelect={(client: Client) => setSelectedClient(client)}
                    />
                )}

                {activeTab === 'invoices' && (
                    <InvoiceManagement
                        selectedClient={selectedClient}
                        onClientSelect={(client: Client) => setSelectedClient(client)}
                    />
                )}
            </main>

            <style>{`
                .dashboard {
                    min-height: 100vh;
                    background-color: #f8f9fa;
                }

                .dashboard-header {
                    background-color: white;
                    border-bottom: 1px solid #e9ecef;
                    padding: 1rem 0;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-content h1 {
                    margin: 0;
                    color: #333;
                    font-size: 1.8rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .dashboard-nav {
                    background-color: white;
                    border-bottom: 1px solid #e9ecef;
                    padding: 0;
                    display: flex;
                    max-width: 1200px;
                    margin: 0 auto;
                    overflow-x: auto;
                }

                .nav-button {
                    background: none;
                    border: none;
                    padding: 15px 20px;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                    border-bottom: 3px solid transparent;
                    font-size: 14px;
                    font-weight: 500;
                }

                .nav-button:hover {
                    background-color: #f8f9fa;
                }

                .nav-button.active {
                    border-bottom-color: #007bff;
                    color: #007bff;
                    background-color: #f8f9fa;
                }

                .dashboard-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .overview-section h2 {
                    margin-bottom: 30px;
                    color: #333;
                }

                .quick-actions-section {
                    margin-top: 40px;
                }

                .quick-actions-section h3 {
                    margin-bottom: 20px;
                    color: #333;
                }

                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .quick-action-card {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .quick-action-card:hover {
                    border-color: #007bff;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }

                .quick-action-card .icon {
                    font-size: 2rem;
                    margin-bottom: 10px;
                }

                .quick-action-card .title {
                    font-weight: bold;
                    font-size: 1.1rem;
                    color: #333;
                }

                .quick-action-card .description {
                    color: #666;
                    font-size: 0.9rem;
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                    text-decoration: none;
                    display: inline-block;
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

                .loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f8f9fa;
                }

                .loading-spinner {
                    font-size: 1.2rem;
                    color: #666;
                }

                @media (max-width: 768px) {
                    .header-content {
                        padding: 0 15px;
                    }

                    .header-content h1 {
                        font-size: 1.5rem;
                    }

                    .dashboard-content {
                        padding: 15px;
                    }

                    .quick-actions-grid {
                        grid-template-columns: 1fr;
                    }

                    .nav-button {
                        padding: 12px 15px;
                        font-size: 13px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;