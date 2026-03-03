import React, { useState, useEffect } from 'react';
import { revenueApi } from '../../services/revenueApi';
import { Link } from 'react-router-dom';

const ViewAllLands = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    try {
      const res = await revenueApi.getAllLands({ limit: 100 });
      setLands(res.data.lands);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    ACTIVE:               'bg-green-100 text-green-800',
    LOCKED:               'bg-yellow-100 text-yellow-800',
    DISPUTED:             'bg-red-100 text-red-800',
    PENDING_TRANSFER:     'bg-blue-100 text-blue-800',
    PENDING_VERIFICATION: 'bg-orange-100 text-orange-800',
  };

  const filtered = lands.filter(land => {
    const matchSearch = search === '' ||
      land.surveyNumber?.toLowerCase().includes(search.toLowerCase()) ||
      land.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      land.landId?.toLowerCase().includes(search.toLowerCase()) ||
      land.location?.district?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || land.currentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Land Records</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} of {lands.length} lands</p>
        </div>
        <Link to="/revenue-dashboard" className="text-indigo-600 hover:underline text-sm">← Back to Dashboard</Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by survey no., owner, district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="LOCKED">Locked</option>
          <option value="DISPUTED">Disputed</option>
          <option value="PENDING_TRANSFER">Pending Transfer</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Land ID', 'Survey No.', 'Owner', 'Location', 'Area', 'Market Value', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(land => (
                <tr key={land.landId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{land.landId}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{land.surveyNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{land.ownerName}</div>
                    <div className="text-xs text-gray-400">{land.ownerAadhaar}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{land.location?.village}, {land.location?.district}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{land.areaSqFt} sq.ft</td>
                  <td className="px-4 py-3 text-sm text-gray-500">₹{land.marketValue?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{land.landType}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[land.currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {land.currentStatus?.replace(/_/g, ' ')}
                    </span>
                    {land.isMortgaged && <span className="ml-1 text-xs">🔒</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/land/${land.landId}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-sm">No lands found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllLands;