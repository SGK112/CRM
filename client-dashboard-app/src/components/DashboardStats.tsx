import React from 'react';
import { DashboardStats as StatsType, ActivityItem } from '../types';

interface DashboardStatsProps {
    stats: StatsType;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    return (
        <div className="dashboard-stats">
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.totalClients}</h3>
                        <p className="stat-label">Total Clients</p>
                        <p className="stat-change positive">+{stats.newClientsThisMonth} this month</p>
                    </div>
                </div>

                <div className="stat-card secondary">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.totalEstimates}</h3>
                        <p className="stat-label">Total Estimates</p>
                        <p className="stat-change">{stats.pendingEstimates} pending</p>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{formatCurrency(stats.totalRevenue)}</h3>
                        <p className="stat-label">Total Revenue</p>
                        <p className="stat-change positive">{formatCurrency(stats.monthlyRevenue)} this month</p>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{formatPercentage(stats.conversionRate)}</h3>
                        <p className="stat-label">Conversion Rate</p>
                        <p className="stat-change">{stats.convertedEstimates} converted estimates</p>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.overdueInvoices}</h3>
                        <p className="stat-label">Overdue Invoices</p>
                        <p className="stat-change negative">{formatCurrency(stats.overdueAmount)} total</p>
                    </div>
                </div>

                <div className="stat-card accent">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.paidInvoices}</h3>
                        <p className="stat-label">Paid Invoices</p>
                        <p className="stat-change positive">{formatCurrency(stats.paidAmount)} total</p>
                    </div>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {stats.recentActivity?.map((activity: ActivityItem, index: number) => (
                        <div key={index} className="activity-item">
                            <div className="activity-icon">{activity.icon}</div>
                            <div className="activity-content">
                                <p className="activity-text">{activity.description}</p>
                                <p className="activity-time">{activity.timestamp}</p>
                            </div>
                        </div>
                    )) || (
                        <p className="no-activity">No recent activity</p>
                    )}
                </div>
            </div>

            <style>{`
                .dashboard-stats {
                    margin-bottom: 40px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border-left: 4px solid transparent;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .stat-card:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }

                .stat-card.primary {
                    border-left-color: #007bff;
                }

                .stat-card.secondary {
                    border-left-color: #6c757d;
                }

                .stat-card.success {
                    border-left-color: #28a745;
                }

                .stat-card.info {
                    border-left-color: #17a2b8;
                }

                .stat-card.warning {
                    border-left-color: #ffc107;
                }

                .stat-card.accent {
                    border-left-color: #6f42c1;
                }

                .stat-icon {
                    font-size: 2.5rem;
                    opacity: 0.8;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-number {
                    margin: 0 0 4px 0;
                    font-size: 2rem;
                    font-weight: bold;
                    color: #333;
                    line-height: 1;
                }

                .stat-label {
                    margin: 0 0 8px 0;
                    color: #666;
                    font-size: 0.9rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-change {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #888;
                }

                .stat-change.positive {
                    color: #28a745;
                }

                .stat-change.negative {
                    color: #dc3545;
                }

                .recent-activity {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .recent-activity h3 {
                    margin: 0 0 20px 0;
                    color: #333;
                    font-size: 1.2rem;
                }

                .activity-list {
                    max-height: 300px;
                    overflow-y: auto;
                }

                .activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px 0;
                    border-bottom: 1px solid #f1f1f1;
                }

                .activity-item:last-child {
                    border-bottom: none;
                }

                .activity-icon {
                    font-size: 1.2rem;
                    opacity: 0.7;
                    margin-top: 2px;
                }

                .activity-content {
                    flex: 1;
                }

                .activity-text {
                    margin: 0 0 4px 0;
                    color: #333;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }

                .activity-time {
                    margin: 0;
                    color: #888;
                    font-size: 0.8rem;
                }

                .no-activity {
                    text-align: center;
                    color: #666;
                    font-style: italic;
                    padding: 20px;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }

                    .stat-card {
                        padding: 20px;
                    }

                    .stat-number {
                        font-size: 1.6rem;
                    }

                    .recent-activity {
                        padding: 20px;
                    }
                }

                @media (max-width: 480px) {
                    .stat-card {
                        flex-direction: column;
                        text-align: center;
                        gap: 12px;
                    }

                    .stat-icon {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default DashboardStats;