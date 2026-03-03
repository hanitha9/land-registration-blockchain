import React, { useState, useCallback } from 'react';
import { bankApi } from '../../services/bankApi';
import LoanReviewModal from '../../components/LoanReviewModal';
import ClearLoanModal from '../../components/ClearLoanModal';

const StatusBadge = ({ status }) => {
  const config = {
    PENDING:  'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-red-100 text-red-800 border-red-200',
    CLEARED:  'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-gray-100 text-gray-700 border-gray-200',
    ACTIVE:   'bg-green-100 text-green-700 border-green-200',
    LOCKED:   'bg-red-100 text-red-700 border-red-200',
    DISPUTED: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return (
    <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-semibold ${config[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl text-white shadow-2xl max-w-sm ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      <span>{type === 'error' ? '❌' : '✅'}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-white/70 hover:text-white ml-2 text-lg leading-none">×</button>
    </div>
  );
};

const Th = ({ children }) => <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50">{children}</th>;
const Td = ({ children }) => <td className="px-4 py-4 align-middle">{children}</td>;

const EmptyState = ({ tab }) => {
  const map = {
    pending:  { icon: '📭', title: 'No Pending Requests',  sub: 'All loan applications have been processed.' },
    active:   { icon: '🏠', title: 'No Active Mortgages',  sub: 'No lands are currently mortgaged with your bank.' },
    cleared:  { icon: '🎉', title: 'No Cleared Loans',     sub: 'Cleared loans will appear here.' },
    rejected: { icon: '📋', title: 'No Rejected Loans',    sub: 'Rejected loan records will appear here.' },
  };
  const m = map[tab];
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{m.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{m.title}</h3>
      <p className="text-sm text-gray-500 mt-1">{m.sub}</p>
    </div>
  );
};

const PendingTable = ({ loans, onReview }) => (
  <div>
    <p className="text-sm text-gray-500 mb-4">Click <strong>"Review"</strong> to perform blockchain verification and approve or reject.</p>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead><tr><Th>Request ID</Th><Th>Applicant</Th><Th>Survey Number</Th><Th>Location</Th><Th>Requested Amount</Th><Th>Purpose</Th><Th>Date</Th><Th>Land Status</Th><Th>Action</Th></tr></thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loans.map((loan) => (
            <tr key={loan.requestId || loan._id} className="hover:bg-gray-50 transition-colors">
              <Td><span className="font-mono text-xs font-semibold text-indigo-700">{loan.requestId}</span></Td>
              <Td><div><p className="font-medium text-gray-900 text-sm">{loan.applicantName || loan.applicantId?.fullName}</p><p className="text-xs text-gray-400">{loan.applicantAadhaar || loan.applicantId?.aadhaarNumber}</p></div></Td>
              <Td><span className="text-xs font-mono text-gray-700">{loan.surveyNumber}</span></Td>
              <Td><span className="text-sm text-gray-600">{loan.village}, {loan.district}</span></Td>
              <Td><span className="font-semibold text-gray-900">₹{Number(loan.requestedAmount || 0).toLocaleString('en-IN')}</span></Td>
              <Td><span className="text-sm text-gray-600">{loan.purpose}</span></Td>
              <Td><span className="text-sm text-gray-500">{new Date(loan.requestDate || loan.createdAt).toLocaleDateString('en-IN')}</span></Td>
              <Td><StatusBadge status={loan.landStatus || 'ACTIVE'} /></Td>
              <Td>
                <button onClick={() => onReview(loan)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">
                  👁️ Review
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ActiveTable = ({ loans, onClear }) => (
  <div>
    <p className="text-sm text-gray-500 mb-4">These lands are <strong>LOCKED</strong> on blockchain. Click <strong>"Clear Loan"</strong> after borrower repays to release the land.</p>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead><tr><Th>Loan ID</Th><Th>Borrower</Th><Th>Survey Number</Th><Th>Location</Th><Th>Approved Amount</Th><Th>Mortgage Date</Th><Th>Land Status</Th><Th>Action</Th></tr></thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loans.map((loan) => (
            <tr key={loan.requestId || loan._id} className="hover:bg-gray-50 transition-colors">
              <Td><span className="font-mono text-xs font-semibold text-red-700">{loan.requestId}</span></Td>
              <Td><div><p className="font-medium text-gray-900 text-sm">{loan.applicantName || loan.applicantId?.fullName}</p><p className="text-xs text-gray-400">{loan.applicantAadhaar || loan.applicantId?.aadhaarNumber}</p></div></Td>
              <Td><span className="text-xs font-mono text-gray-700">{loan.surveyNumber}</span></Td>
              <Td><span className="text-sm text-gray-600">{loan.village}, {loan.district}</span></Td>
              <Td><span className="font-bold text-red-700">₹{Number(loan.approvedAmount || 0).toLocaleString('en-IN')}</span></Td>
              <Td><span className="text-sm text-gray-500">{loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString('en-IN') : '—'}</span></Td>
              <Td><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><StatusBadge status="LOCKED" /></div></Td>
              <Td>
                <button onClick={() => onClear(loan)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">
                  🔓 Clear Loan
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ClearedTable = ({ loans }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead><tr><Th>Loan ID</Th><Th>Borrower</Th><Th>Survey Number</Th><Th>Approved Amount</Th><Th>Approval Date</Th><Th>Clearance Date</Th><Th>Land Status</Th><Th>Loan Status</Th></tr></thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {loans.map((loan) => (
          <tr key={loan.requestId || loan._id} className="hover:bg-gray-50">
            <Td><span className="font-mono text-xs font-semibold text-green-700">{loan.requestId}</span></Td>
            <Td><div><p className="font-medium text-gray-900 text-sm">{loan.applicantName || loan.applicantId?.fullName}</p><p className="text-xs text-gray-400">{loan.applicantAadhaar || loan.applicantId?.aadhaarNumber}</p></div></Td>
            <Td><span className="text-xs font-mono text-gray-700">{loan.surveyNumber}</span></Td>
            <Td><span className="font-semibold text-gray-700">₹{Number(loan.approvedAmount || 0).toLocaleString('en-IN')}</span></Td>
            <Td><span className="text-sm text-gray-500">{loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString('en-IN') : '—'}</span></Td>
            <Td><span className="text-sm text-gray-500">{loan.clearanceDate ? new Date(loan.clearanceDate).toLocaleDateString('en-IN') : '—'}</span></Td>
            <Td><StatusBadge status={loan.landStatus || 'ACTIVE'} /></Td>
            <Td><StatusBadge status="CLEARED" /></Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RejectedTable = ({ loans }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead><tr><Th>Loan ID</Th><Th>Applicant</Th><Th>Survey Number</Th><Th>Requested Amount</Th><Th>Rejection Reason</Th><Th>Date</Th><Th>Status</Th></tr></thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {loans.map((loan) => (
          <tr key={loan.requestId || loan._id} className="hover:bg-gray-50">
            <Td><span className="font-mono text-xs font-semibold text-gray-600">{loan.requestId}</span></Td>
            <Td><div><p className="font-medium text-gray-900 text-sm">{loan.applicantName || loan.applicantId?.fullName}</p><p className="text-xs text-gray-400">{loan.applicantAadhaar || loan.applicantId?.aadhaarNumber}</p></div></Td>
            <Td><span className="text-xs font-mono text-gray-700">{loan.surveyNumber}</span></Td>
            <Td><span className="font-semibold text-gray-700">₹{Number(loan.requestedAmount || 0).toLocaleString('en-IN')}</span></Td>
            <Td><span className="text-sm text-red-600 italic">{loan.rejectionReason || '—'}</span></Td>
            <Td><span className="text-sm text-gray-500">{new Date(loan.requestDate || loan.createdAt).toLocaleDateString('en-IN')}</span></Td>
            <Td><StatusBadge status="REJECTED" /></Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── MAIN DASHBOARD ────────────────────────────────────────────────────
const BankManagerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [reviewingLoan, setReviewingLoan] = useState(null);
  const [clearingLoan, setClearingLoan] = useState(null);
  const [toast, setToast] = useState(null);
  const [blockedPopup, setBlockedPopup] = useState(null);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [pendingRes, activeRes, clearedRes] = await Promise.all([
          bankApi.getPendingLoans(),
          bankApi.getActiveMortgages(),
          bankApi.getClearedLoans(),
        ]);
        const normalise = (list, status) =>
          (list || []).map((l) => ({
            ...l,
            applicantName:    l.applicantName    || l.applicantId?.fullName      || '',
            applicantAadhaar: l.applicantAadhaar  || l.applicantId?.aadhaarNumber || '',
            applicantMobile:  l.applicantMobile   || l.applicantId?.mobile        || '',
            status,
          }));
        const pending = normalise(pendingRes.data.loans,  'PENDING');
        const active  = normalise(activeRes.data.loans,   'APPROVED');
        const cleared = normalise(clearedRes.data.loans,  'CLEARED');
        let rejected = [];
        try { const rejRes = await bankApi.getRejectedLoans?.(); rejected = normalise(rejRes?.data?.loans, 'REJECTED'); } catch (_) {}
        setLoans([...pending, ...active, ...cleared, ...rejected]);
      } catch (err) {
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [showToast]);

  const pendingLoans   = loans.filter((l) => l.status === 'PENDING');
  const activeLoans    = loans.filter((l) => l.status === 'APPROVED');
  const clearedLoans   = loans.filter((l) => l.status === 'CLEARED');
  const rejectedLoans  = loans.filter((l) => l.status === 'REJECTED');
  const totalDisbursed = activeLoans.reduce((s, l) => s + Number(l.approvedAmount || 0), 0);

  const handleApprove = useCallback(async (requestId, approvedAmount) => {
    try {
      await bankApi.approveLoan({ requestId, approvedAmount });
      setLoans((prev) => prev.map((l) => l.requestId === requestId ? { ...l, status: 'APPROVED', approvedAmount, approvalDate: new Date().toISOString().split('T')[0], landStatus: 'LOCKED', isMortgaged: true } : l));
      setReviewingLoan(null);
      setActiveTab('active');
      showToast(`✅ Loan ${requestId} approved for ₹${Number(approvedAmount).toLocaleString('en-IN')}. Land is now LOCKED on blockchain.`, 'success');
    } catch (err) {
      const data = err.response?.data;
      if (data?.blocked) {
        setBlockedPopup({ message: data.message, reason: data.reason });
      } else {
        showToast(data?.message || 'Approval failed. Please try again.', 'error');
      }
    }
  }, [showToast]);

  const handleReject = useCallback(async (requestId, rejectionReason) => {
    try {
      await bankApi.rejectLoan({ requestId, rejectionReason });
      setLoans((prev) => prev.map((l) => l.requestId === requestId ? { ...l, status: 'REJECTED', rejectionReason } : l));
      setReviewingLoan(null);
      setActiveTab('rejected');
      showToast(`Loan ${requestId} has been rejected.`, 'error');
    } catch (err) {
      showToast(err.response?.data?.message || 'Rejection failed. Please try again.', 'error');
    }
  }, [showToast]);

  const handleClearLoan = useCallback(async (loanId) => {
    try {
      await bankApi.clearLoan({ loanId });
      setLoans((prev) => prev.map((l) => l.requestId === loanId ? { ...l, status: 'CLEARED', clearanceDate: new Date().toISOString().split('T')[0], landStatus: 'ACTIVE', isMortgaged: false } : l));
      setClearingLoan(null);
      setActiveTab('cleared');
      showToast(`🔓 Loan ${loanId} cleared! Land is now ACTIVE and released from mortgage on blockchain.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Clearance failed. Please try again.', 'error');
    }
  }, [showToast]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" /></div>;

  const tabs = [
    { key: 'pending',  label: 'Pending Requests', count: pendingLoans.length  },
    { key: 'active',   label: 'Active Mortgages',  count: activeLoans.length   },
    { key: 'cleared',  label: 'Cleared Loans',     count: clearedLoans.length  },
    { key: 'rejected', label: 'Rejected',          count: rejectedLoans.length },
  ];

  const currentList = { pending: pendingLoans, active: activeLoans, cleared: clearedLoans, rejected: rejectedLoans }[activeTab];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* 🔒 Blockchain Fraud Block Popup */}
      {blockedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔒</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-700 mb-2">Loan Blocked by Blockchain</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{blockedPopup.message}</p>
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-mono">Enforced by: Hyperledger Fabric Chaincode</p>
                  <p className="text-xs text-gray-500 font-mono">Channel: landchannel</p>
                  <p className="text-xs text-gray-500 font-mono">Chaincode: landregistry v3.0</p>
                </div>
              </div>
            </div>
            <button onClick={() => setBlockedPopup(null)} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bank Manager Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage loan applications and mortgages</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Pending Requests', value: pendingLoans.length,  icon: '⏳', color: 'yellow', tab: 'pending' },
          { label: 'Active Mortgages',  value: activeLoans.length,   icon: '🔒', color: 'red',    tab: 'active'  },
          { label: 'Cleared Loans',     value: clearedLoans.length,  icon: '✅', color: 'green',  tab: 'cleared' },
          { label: 'Total Disbursed',   value: `₹${(totalDisbursed/10000000).toFixed(2)} Cr`, icon: '💰', color: 'indigo', tab: 'active' },
        ].map(({ label, value, icon, color, tab }) => {
          const bg   = { yellow: 'bg-yellow-50 border border-yellow-200', red: 'bg-red-50 border border-red-200', green: 'bg-green-50 border border-green-200', indigo: 'bg-indigo-50 border border-indigo-200' };
          const text = { yellow: 'text-yellow-700', red: 'text-red-700', green: 'text-green-700', indigo: 'text-indigo-700' };
          return (
            <button key={label} onClick={() => setActiveTab(tab)} className={`rounded-xl p-6 text-left cursor-pointer hover:shadow-md transition-shadow ${bg[color]}`}>
              <div className="text-2xl mb-2">{icon}</div>
              <div className={`text-2xl font-bold ${text[color]}`}>{value}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </button>
          );
        })}
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="p-6">
          {currentList.length === 0 ? <EmptyState tab={activeTab} />
            : activeTab === 'pending'  ? <PendingTable  loans={currentList} onReview={setReviewingLoan} />
            : activeTab === 'active'   ? <ActiveTable   loans={currentList} onClear={setClearingLoan} />
            : activeTab === 'cleared'  ? <ClearedTable  loans={currentList} />
            : <RejectedTable loans={currentList} />}
        </div>
      </div>

      {reviewingLoan && <LoanReviewModal loan={reviewingLoan} onClose={() => setReviewingLoan(null)} onApprove={handleApprove} onReject={handleReject} />}
      {clearingLoan  && <ClearLoanModal  loan={clearingLoan}  onClose={() => setClearingLoan(null)}  onClear={handleClearLoan} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  );
};

export default BankManagerDashboard;