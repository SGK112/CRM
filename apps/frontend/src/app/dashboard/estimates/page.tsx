'use client';

import { Eye, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Estimate {
  _id: string;
  number: string;
  status: string;
  clientId?: string;
  subtotalSell: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  client?: {
    firstName: string;
    lastName: string;
    company?: string;
  };
  project?: {
    title: string;
  };
}

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const token = (typeof window !== 'undefined') ?
    (localStorage.getItem('accessToken') || localStorage.getItem('token')) : '';

  const fetchEstimates = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/estimates', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setEstimates(data);
      } else {
        setError('Failed to load estimates');
      }
    } catch (err) {
      setError('Error loading estimates');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  const filteredEstimates = estimates.filter(estimate => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      estimate.number.toLowerCase().includes(search) ||
      (estimate.client?.firstName?.toLowerCase().includes(search)) ||
      (estimate.client?.lastName?.toLowerCase().includes(search)) ||
      (estimate.client?.company?.toLowerCase().includes(search))
    );
  });

  const totalValue = filteredEstimates.reduce((sum, e) => sum + e.total, 0);

  const handleDelete = async (id: string) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    const ok = window.confirm('Delete this estimate? This cannot be undone.');
    if (!ok) return;
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEstimates(prev => prev.filter(e => e._id !== id));
      } else {
        setError('Failed to delete estimate');
      }
    } catch (e) {
      setError('Error deleting estimate');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Simple Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e5e5e5', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '600' }}>Estimates</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {filteredEstimates.length} estimates • ${totalValue.toLocaleString()} total
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999', width: '16px', height: '16px' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              style={{
                paddingLeft: '35px',
                paddingRight: '15px',
                paddingTop: '8px',
                paddingBottom: '8px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                width: '200px'
              }}
            />
          </div>

          <Link
            href="/dashboard/estimates/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            New
          </Link>
        </div>
      </div>

      {/* Simple Table */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Number</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Client</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEstimates.map((estimate, index) => (
              <tr key={estimate._id} style={{ borderTop: index > 0 ? '1px solid #f0f0f0' : 'none' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontFamily: 'monospace', fontWeight: '500' }}>
                  {estimate.number}
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>
                      {estimate.client ?
                        `${estimate.client.firstName} ${estimate.client.lastName}` :
                        'No Client'
                      }
                    </div>
                    {estimate.client?.company && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {estimate.client.company}
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: '500',
                    borderRadius: '12px',
                    textTransform: 'capitalize',
                    backgroundColor:
                      estimate.status === 'draft' ? '#f3f4f6' :
                      estimate.status === 'sent' ? '#dbeafe' :
                      estimate.status === 'accepted' ? '#d1fae5' :
                      estimate.status === 'rejected' ? '#fee2e2' :
                      '#e0e7ff',
                    color:
                      estimate.status === 'draft' ? '#374151' :
                      estimate.status === 'sent' ? '#1e40af' :
                      estimate.status === 'accepted' ? '#059669' :
                      estimate.status === 'rejected' ? '#dc2626' :
                      '#5b21b6'
                  }}>
                    {estimate.status}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>
                  ${estimate.total.toLocaleString()}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                  {new Date(estimate.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <Link
                      href={`/dashboard/estimates/${estimate._id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: '#f8f9fa',
                        color: '#007bff',
                        textDecoration: 'none',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                    </Link>
                    <button
                      onClick={() => handleDelete(estimate._id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: '#fff5f5',
                        color: '#dc2626',
                        border: '1px solid #fecaca'
                      }}
                      title="Delete"
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEstimates.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <div>
                    {searchTerm ? 'No estimates match your search' : 'No estimates found'}
                  </div>
                  {!searchTerm && (
                    <Link
                      href="/dashboard/estimates/new"
                      style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px', marginTop: '8px', display: 'inline-block' }}
                    >
                      Create your first estimate
                    </Link>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Error */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '6px',
          border: '1px solid #fecaca',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '16px',
                marginLeft: '8px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
