module.exports = [
  // Citizen Notifications
  {
    userId: "USR_CIT_001", // Hanitha Ganisetti
    title: "Land Registered",
    message: "Your land LAND_001 has been registered successfully",
    type: "success",
    relatedEntity: "land",
    entityId: "LAND_001"
  },
  {
    userId: "USR_CIT_001", // Hanitha Ganisetti
    title: "Loan Approved",
    message: "Your loan application LN_001 has been approved by State Bank of India",
    type: "success",
    relatedEntity: "loan",
    entityId: "LN_001"
  },
  {
    userId: "USR_CIT_001", // Hanitha Ganisetti
    title: "Land Mortgaged",
    message: "Your land LAND_002 is now under mortgage with State Bank of India",
    type: "info",
    relatedEntity: "land",
    entityId: "LAND_002"
  },
  {
    userId: "USR_CIT_001", // Hanitha Ganisetti
    title: "Transfer Blocked",
    message: "⚠️ Your attempt to sell LAND_002 was BLOCKED - Active mortgage exists",
    type: "warning",
    relatedEntity: "transfer",
    entityId: "TR_004"
  },
  {
    userId: "USR_CIT_002", // Ravi Kumar Sharma
    title: "New Loan Application",
    message: "Your loan application for land SV_2024_004 has been submitted to State Bank of India",
    type: "info",
    relatedEntity: "loan",
    entityId: "LN_006"
  },
  {
    userId: "USR_CIT_003", // Priya Reddy
    title: "Sale Initiated",
    message: "Sale of land SV_2024_006 initiated to Venkat Rao",
    type: "info",
    relatedEntity: "transfer",
    entityId: "TR_001"
  },
  {
    userId: "USR_CIT_003", // Priya Reddy
    title: "Land Sale Offer",
    message: "Hanitha Ganisetti wants to sell land SV_2024_007 to you",
    type: "info",
    relatedEntity: "transfer",
    entityId: "TR_003"
  },
  {
    userId: "USR_CIT_004", // Arun Krishnan
    title: "New Loan Application",
    message: "Your loan application for land SV_2024_008 has been submitted to HDFC Bank",
    type: "info",
    relatedEntity: "loan",
    entityId: "LN_007"
  },
  {
    userId: "USR_CIT_005", // Lakshmi Devi
    title: "Land Marked as Disputed",
    message: "Your land SV_2024_009 has been marked as disputed. Reason: Boundary conflict reported",
    type: "warning",
    relatedEntity: "land",
    entityId: "LAND_009"
  },
  {
    userId: "USR_CIT_006", // Suresh Babu
    title: "Loan Approved",
    message: "Your loan application LN_002 has been approved by HDFC Bank",
    type: "success",
    relatedEntity: "loan",
    entityId: "LN_002"
  },
  {
    userId: "USR_CIT_007", // Anita Kumari
    title: "Loan Cleared",
    message: "Your loan LN_010 has been cleared. Your land SV_2024_012 is now free",
    type: "success",
    relatedEntity: "loan",
    entityId: "LN_010"
  },
  {
    userId: "USR_CIT_007", // Anita Kumari
    title: "Land Transfer Completed",
    message: "Transfer of land SV_2024_012 to Deepa Nair completed successfully",
    type: "success",
    relatedEntity: "transfer",
    entityId: "TR_006"
  },
  {
    userId: "USR_CIT_008", // Venkat Rao
    title: "Land Sale Offer",
    message: "Priya Reddy wants to sell land SV_2024_006 to you",
    type: "info",
    relatedEntity: "transfer",
    entityId: "TR_001"
  },
  {
    userId: "USR_CIT_009", // Meera Singh
    title: "Land Sale Offer",
    message: "Meera Singh wants to sell land SV_2024_015 to you",
    type: "info",
    relatedEntity: "transfer",
    entityId: "TR_002"
  },
  {
    userId: "USR_CIT_010", // Rajesh Gupta
    title: "Land Sale Offer",
    message: "Meera Singh wants to sell land SV_2024_015 to you",
    type: "info",
    relatedEntity: "transfer",
    entityId: "TR_002"
  },
  {
    userId: "USR_CIT_011", // Sunita Patel
    title: "Loan Cleared",
    message: "Your loan LN_011 has been cleared. Your land SV_2024_018 is now free",
    type: "success",
    relatedEntity: "loan",
    entityId: "LN_011"
  },
  {
    userId: "USR_CIT_012", // Kiran Kumar
    title: "Loan Approved",
    message: "Your loan application LN_003 has been approved by State Bank of India",
    type: "success",
    relatedEntity: "loan",
    entityId: "LN_003"
  },
  {
    userId: "USR_CIT_013", // Deepa Nair
    title: "Land Transfer Completed",
    message: "You are now the owner of land SV_2024_012",
    type: "success",
    relatedEntity: "transfer",
    entityId: "TR_006"
  },
  {
    userId: "USR_CIT_014", // Ramesh Choudhary
    title: "Land Transfer Completed",
    message: "You are now the owner of land SV_2024_018",
    type: "success",
    relatedEntity: "transfer",
    entityId: "TR_007"
  },
  {
    userId: "USR_CIT_015", // Kavitha Reddy
    title: "New Loan Application",
    message: "Your loan application for land SV_2024_025 has been submitted to State Bank of India",
    type: "info",
    relatedEntity: "loan",
    entityId: "LN_004"
  },

  // Revenue Officer Notifications
  {
    userId: "USR_OFF_001", // Revenue Officer 1
    title: "New Land Registration Request",
    message: "New land registration request from Hanitha Ganisetti",
    type: "info",
    relatedEntity: "land",
    entityId: "LAND_001"
  },
  {
    userId: "USR_OFF_001", // Revenue Officer 1
    title: "Land Disputed",
    message: "Land SV_2024_009 has been marked as DISPUTED",
    type: "warning",
    relatedEntity: "land",
    entityId: "LAND_009"
  },
  {
    userId: "USR_OFF_002", // Revenue Officer 2
    title: "Pending Requests",
    message: "5 pending requests awaiting your review",
    type: "info"
  },

  // Bank Manager Notifications
  {
    userId: "USR_OFF_003", // SBI Bank Manager
    title: "New Loan Application",
    message: "New loan application LN_004 from Kavitha Reddy",
    type: "info",
    relatedEntity: "loan",
    entityId: "LN_004"
  },
  {
    userId: "USR_OFF_003", // SBI Bank Manager
    title: "Pending Loan Requests",
    message: "4 pending loan requests for review",
    type: "info"
  },
  {
    userId: "USR_OFF_003", // SBI Bank Manager
    title: "Duplicate Mortgage Attempt",
    message: "⚠️ Duplicate mortgage attempt detected on LAND_011",
    type: "warning",
    relatedEntity: "loan",
    entityId: "LN_005"
  },
  {
    userId: "USR_OFF_004", // HDFC Bank Manager
    title: "New Loan Application",
    message: "New loan application LN_005 from Kavitha Reddy",
    type: "info",
    relatedEntity: "loan",
    entityId: "LN_005"
  },
  {
    userId: "USR_OFF_004", // HDFC Bank Manager
    title: "Loan Rejected",
    message: "Loan application LN_009 rejected due to insufficient documentation",
    type: "info",
    relatedEntity: "loan",
    entityId: "LN_009"
  },

  // Sub-Registrar Notifications
  {
    userId: "USR_OFF_005", // Sub-Registrar
    title: "New Transfer Request",
    message: "New transfer request TR_001 awaiting approval",
    type: "info",
    relatedEntity: "transfer",
    entityId: "TR_001"
  },
  {
    userId: "USR_OFF_005", // Sub-Registrar
    title: "Transfer Blocked",
    message: "🚫 Transfer TR_004 auto-blocked: Land is mortgaged",
    type: "error",
    relatedEntity: "transfer",
    entityId: "TR_004"
  },
  {
    userId: "USR_OFF_005", // Sub-Registrar
    title: "Pending Transfers",
    message: "3 pending transfers for review",
    type: "info"
  }
];