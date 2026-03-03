import React, { useState } from 'react';

const ClearLoanModal = ({ loan, onClose, onClear }) => {
  const [confirmed, setConfirmed]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const applicantName    = loan.applicantName    || loan.applicantId?.fullName      || '—';
  const applicantAadhaar = loan.applicantAadhaar || loan.applicantId?.aadhaarNumber || '—';
  const approvedAmount   = Number(loan.approvedAmount || 0);

  // ✅ FIX: Call parent directly — parent handles state update and closes modal
  const handleClear = async () => {
    if (!confirmed || submitting) return;
    setSubmitting(true);
    await onClear(loan.requestId);
    // Don't reset submitting — parent will unmount this modal on success
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="bg-orange-500 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">🔓 Clear Loan & Release Land</h2>
            <p className="text-orange-100 text-sm mt-0.5">Loan ID: {loan.requestId}</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Loan Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Loan Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Borrower</p><p className="font-semibold text-gray-900">{applicantName}</p></div>
              <div><p className="text-xs text-gray-400">Aadhaar</p><p className="text-gray-700">{applicantAadhaar}</p></div>
              <div><p className="text-xs text-gray-400">Survey Number</p><p className="font-semibold text-gray-900">{loan.surveyNumber}</p></div>
              <div><p className="text-xs text-gray-400">Location</p><p className="text-gray-700">{loan.village}, {loan.district}</p></div>
              <div>
                <p className="text-xs text-gray-400">Approved Loan Amount</p>
                <p className="font-bold text-indigo-700 text-base">₹{approvedAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Mortgaged Since</p>
                <p className="text-gray-700">
                  {loan.approvalDate ? new Date(loan.approvalDate).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Land Currently: LOCKED on Blockchain</p>
              <p className="text-xs text-red-600 mt-0.5">
                Blocked from sale or re-mortgaging until loan is cleared.
              </p>
            </div>
          </div>

          {/* What happens */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">🔗 Blockchain Changes on Clearing:</h4>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li>→ Land status: <strong>LOCKED → ACTIVE</strong></li>
              <li>→ isMortgaged: <strong>true → false</strong></li>
              <li>→ encumbranceDetails.loanStatus: <strong>APPROVED → CLEARED</strong></li>
              <li>→ Land becomes <strong>eligible for sale or new loan</strong></li>
              <li>→ Clearance transaction logged on <strong>immutable blockchain ledger</strong></li>
            </ul>
          </div>

          {/* ✅ FIX: Real checkbox — reliable onChange, not custom div */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={submitting}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              I confirm that <strong>{applicantName}</strong> has fully repaid the loan of{' '}
              <strong>₹{approvedAmount.toLocaleString('en-IN')}</strong>. I authorize releasing land{' '}
              <strong>{loan.surveyNumber}</strong> from mortgage on the blockchain.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleClear}
              disabled={!confirmed || submitting}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                confirmed && !submitting
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating Blockchain...</>
              ) : '🔓 Clear Loan & Release Land'}
            </button>
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClearLoanModal;