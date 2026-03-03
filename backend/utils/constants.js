module.exports = {
  USER_ROLES: {
    CITIZEN: 'citizen',
    REVENUE_OFFICER: 'revenue_officer',
    BANK_MANAGER: 'bank_manager',
    SUB_REGISTRAR: 'sub_registrar',
    ADMIN: 'admin'
  },
  
  LAND_STATUS: {
    ACTIVE: 'ACTIVE',
    LOCKED: 'LOCKED',
    PENDING_TRANSFER: 'PENDING_TRANSFER',
    DISPUTED: 'DISPUTED'
  },
  
  LOAN_STATUS: {
    PENDING: 'PENDING',
    UNDER_REVIEW: 'UNDER_REVIEW',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CLEARED: 'CLEARED'
  },
  
  TRANSFER_STATUS: {
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    BLOCKED: 'BLOCKED'
  },
  
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  },
  
  TRANSACTION_TYPES: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    MORTGAGE: 'MORTGAGE',
    CLEAR_MORTGAGE: 'CLEAR_MORTGAGE',
    TRANSFER: 'TRANSFER',
    BLOCK_TRANSFER: 'BLOCK_TRANSFER',
    DISPUTE: 'DISPUTE',
    RESOLVE_DISPUTE: 'RESOLVE_DISPUTE',
    LOAN_APPROVAL: 'LOAN_APPROVAL',
    LOAN_REJECTION: 'LOAN_REJECTION',
    LOAN_CLEARANCE: 'LOAN_CLEARANCE'
  },
  
  BANKS: {
    SBI: 'BANK_SBI',
    HDFC: 'BANK_HDFC',
    ICICI: 'BANK_ICICI',
    AXIS: 'BANK_AXIS'
  },
  
  LAND_TYPES: {
    RESIDENTIAL: 'Residential',
    AGRICULTURAL: 'Agricultural',
    COMMERCIAL: 'Commercial',
    INDUSTRIAL: 'Industrial'
  }
};