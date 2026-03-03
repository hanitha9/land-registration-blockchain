module.exports = [
  // Land Creation Transactions
  {
    type: "CREATE",
    landId: "LAND_001",
    initiatedBy: "USR_OFF_001", // Revenue Officer 1
    affectedParties: ["USR_CIT_001"], // Hanitha Ganisetti
    details: "Land SV_2024_001 created for Hanitha Ganisetti by Revenue Officer"
  },
  {
    type: "CREATE",
    landId: "LAND_002",
    initiatedBy: "USR_OFF_001", // Revenue Officer 1
    affectedParties: ["USR_CIT_001"], // Hanitha Ganisetti
    details: "Land SV_2024_002 created for Hanitha Ganisetti by Revenue Officer"
  },
  {
    type: "CREATE",
    landId: "LAND_003",
    initiatedBy: "USR_OFF_001", // Revenue Officer 1
    affectedParties: ["USR_CIT_001"], // Hanitha Ganisetti
    details: "Land SV_2024_003 created for Hanitha Ganisetti by Revenue Officer"
  },
  {
    type: "CREATE",
    landId: "LAND_004",
    initiatedBy: "USR_OFF_001", // Revenue Officer 1
    affectedParties: ["USR_CIT_002"], // Ravi Kumar Sharma
    details: "Land SV_2024_004 created for Ravi Kumar Sharma by Revenue Officer"
  },
  {
    type: "CREATE",
    landId: "LAND_005",
    initiatedBy: "USR_OFF_001", // Revenue Officer 1
    affectedParties: ["USR_CIT_002"], // Ravi Kumar Sharma
    details: "Land SV_2024_005 created for Ravi Kumar Sharma by Revenue Officer"
  },

  // Mortgage Transactions
  {
    type: "MORTGAGE",
    landId: "LAND_002",
    initiatedBy: "USR_OFF_003", // SBI Bank Manager
    affectedParties: ["USR_CIT_001"], // Hanitha Ganisetti
    details: "Loan approved by State Bank of India for ₹25,00,000"
  },
  {
    type: "MORTGAGE",
    landId: "LAND_011",
    initiatedBy: "USR_OFF_004", // HDFC Bank Manager
    affectedParties: ["USR_CIT_006"], // Suresh Babu
    details: "Loan approved by HDFC Bank for ₹40,00,000"
  },
  {
    type: "MORTGAGE",
    landId: "LAND_020",
    initiatedBy: "USR_OFF_003", // SBI Bank Manager
    affectedParties: ["USR_CIT_012"], // Kiran Kumar
    details: "Loan approved by State Bank of India for ₹30,00,000"
  },

  // Transfer Transactions
  {
    type: "TRANSFER",
    landId: "LAND_012",
    initiatedBy: "USR_OFF_005", // Sub-Registrar
    affectedParties: ["USR_CIT_007", "USR_CIT_013"], // Anita Kumari, Deepa Nair
    details: "Land transfer approved by registrar from Anita Kumari to Deepa Nair"
  },
  {
    type: "TRANSFER",
    landId: "LAND_018",
    initiatedBy: "USR_OFF_005", // Sub-Registrar
    affectedParties: ["USR_CIT_011", "USR_CIT_014"], // Sunita Patel, Ramesh Choudhary
    details: "Land transfer approved by registrar from Sunita Patel to Ramesh Choudhary"
  },
  {
    type: "TRANSFER",
    landId: "LAND_021",
    initiatedBy: "USR_OFF_005", // Sub-Registrar
    affectedParties: ["USR_CIT_013", "USR_CIT_011"], // Deepa Nair, Sunita Patel
    details: "Land transfer approved by registrar from Deepa Nair to Sunita Patel"
  },

  // Clear Mortgage Transactions
  {
    type: "CLEAR_MORTGAGE",
    landId: "LAND_012",
    initiatedBy: "USR_OFF_003", // SBI Bank Manager
    affectedParties: ["USR_CIT_007"], // Anita Kumari
    details: "Loan cleared by State Bank of India"
  },
  {
    type: "CLEAR_MORTGAGE",
    landId: "LAND_018",
    initiatedBy: "USR_OFF_004", // HDFC Bank Manager
    affectedParties: ["USR_CIT_011"], // Sunita Patel
    details: "Loan cleared by HDFC Bank"
  },
  {
    type: "CLEAR_MORTGAGE",
    landId: "LAND_021",
    initiatedBy: "USR_OFF_003", // SBI Bank Manager
    affectedParties: ["USR_CIT_013"], // Deepa Nair
    details: "Loan cleared by State Bank of India"
  },

  // Dispute Transactions
  {
    type: "DISPUTE",
    landId: "LAND_009",
    initiatedBy: "USR_OFF_001", // Revenue Officer 1
    affectedParties: ["USR_CIT_005"], // Lakshmi Devi
    details: "Land marked as disputed. Reason: Boundary conflict reported"
  },

  // Block Transfer Transactions
  {
    type: "BLOCK_TRANSFER",
    landId: "LAND_002",
    initiatedBy: "SYSTEM",
    affectedParties: ["USR_CIT_001", "USR_CIT_006"], // Hanitha Ganisetti, Suresh Babu
    details: "Transfer blocked (mortgaged)"
  },
  {
    type: "BLOCK_TRANSFER",
    landId: "LAND_011",
    initiatedBy: "SYSTEM",
    affectedParties: ["USR_CIT_006", "USR_CIT_012"], // Suresh Babu, Kiran Kumar
    details: "Transfer blocked (mortgaged)"
  },
  {
    type: "BLOCK_TRANSFER",
    landId: "LAND_009",
    initiatedBy: "SYSTEM",
    affectedParties: ["USR_CIT_005", "USR_CIT_015"], // Lakshmi Devi, Kavitha Reddy
    details: "Transfer blocked (disputed)"
  },

  // Loan Approval/Rejection Transactions
  {
    type: "LOAN_APPROVAL",
    landId: "LAND_001",
    initiatedBy: "USR_OFF_003", // SBI Bank Manager
    affectedParties: ["USR_CIT_001"], // Hanitha Ganisetti
    details: "Loan approved by State Bank of India for ₹25,00,000"
  },
  {
    type: "LOAN_REJECTION",
    landId: "LAND_014",
    initiatedBy: "USR_OFF_003", // SBI Bank Manager
    affectedParties: ["USR_CIT_008"], // Venkat Rao
    details: "Loan rejected by State Bank of India. Reason: Insufficient documentation provided"
  },
  {
    type: "LOAN_REJECTION",
    landId: "LAND_017",
    initiatedBy: "USR_OFF_004", // HDFC Bank Manager
    affectedParties: ["USR_CIT_010"], // Rajesh Gupta
    details: "Loan rejected by HDFC Bank. Reason: Land value too low for requested amount"
  },

  // Transfer Rejection Transactions
  {
    type: "TRANSFER_REJECTION",
    landId: "LAND_017",
    initiatedBy: "USR_OFF_005", // Sub-Registrar
    affectedParties: ["USR_CIT_010", "USR_CIT_003"], // Rajesh Gupta, Priya Reddy
    details: "Land transfer rejected by registrar. Reason: Document mismatch - buyer's Aadhaar not verified"
  }
];