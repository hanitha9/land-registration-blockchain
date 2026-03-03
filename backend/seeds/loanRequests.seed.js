module.exports = [
  // Approved Loans (Active mortgages)
  {
    requestId: "LN_001",
    landId: "LAND_002",
    surveyNumber: "SV_2024_002",
    applicantId: "USR_CIT_001", // Hanitha Ganisetti
    applicantName: "Hanitha Ganisetti",
    applicantAadhaar: "243107701114",
    requestedAmount: 2500000,
    approvedAmount: 2500000,
    purpose: "Home Construction",
    status: "APPROVED",
    bankId: "BANK_SBI",
    bankName: "State Bank of India",
    managerId: "USR_OFF_003", // SBI Bank Manager
    requestDate: new Date("2025-01-05"),
    approvalDate: new Date("2025-01-05")
  },
  {
    requestId: "LN_002",
    landId: "LAND_011",
    surveyNumber: "SV_2024_011",
    applicantId: "USR_CIT_006", // Suresh Babu
    applicantName: "Suresh Babu",
    applicantAadhaar: "798652256669",
    requestedAmount: 4000000,
    approvedAmount: 4000000,
    purpose: "Agricultural Investment",
    status: "APPROVED",
    bankId: "BANK_HDFC",
    bankName: "HDFC Bank",
    managerId: "USR_OFF_004", // HDFC Bank Manager
    requestDate: new Date("2025-01-07"),
    approvalDate: new Date("2025-01-07")
  },
  {
    requestId: "LN_003",
    landId: "LAND_020",
    surveyNumber: "SV_2024_020",
    applicantId: "USR_CIT_012", // Kiran Kumar
    applicantName: "Kiran Kumar",
    applicantAadhaar: "434218812225",
    requestedAmount: 3000000,
    approvedAmount: 3000000,
    purpose: "Business Expansion",
    status: "APPROVED",
    bankId: "BANK_SBI",
    bankName: "State Bank of India",
    managerId: "USR_OFF_003", // SBI Bank Manager
    requestDate: new Date("2025-01-08"),
    approvalDate: new Date("2025-01-08")
  },

  // Pending Loans
  {
    requestId: "LN_004",
    landId: "LAND_025",
    surveyNumber: "SV_2024_025",
    applicantId: "USR_CIT_015", // Kavitha Reddy
    applicantName: "Kavitha Reddy",
    applicantAadhaar: "767541145558",
    requestedAmount: 2000000,
    purpose: "Home Renovation",
    status: "PENDING",
    bankId: "BANK_SBI",
    bankName: "State Bank of India",
    requestDate: new Date("2025-01-15")
  },
  {
    requestId: "LN_005",
    landId: "LAND_024",
    surveyNumber: "SV_2024_024",
    applicantId: "USR_CIT_015", // Kavitha Reddy
    applicantName: "Kavitha Reddy",
    applicantAadhaar: "767541145558",
    requestedAmount: 3500000,
    purpose: "Agricultural Equipment",
    status: "PENDING",
    bankId: "BANK_HDFC",
    bankName: "HDFC Bank",
    requestDate: new Date("2025-01-15")
  },
  {
    requestId: "LN_006",
    landId: "LAND_004",
    surveyNumber: "SV_2024_004",
    applicantId: "USR_CIT_002", // Ravi Kumar Sharma
    applicantName: "Ravi Kumar Sharma",
    applicantAadhaar: "354218812225",
    requestedAmount: 8000000,
    purpose: "Real Estate Investment",
    status: "PENDING",
    bankId: "BANK_SBI",
    bankName: "State Bank of India",
    requestDate: new Date("2025-01-16")
  },
  {
    requestId: "LN_007",
    landId: "LAND_008",
    surveyNumber: "SV_2024_008",
    applicantId: "USR_CIT_004", // Arun Krishnan
    applicantName: "Arun Krishnan",
    applicantAadhaar: "576430034447",
    requestedAmount: 4500000,
    purpose: "Farm Modernization",
    status: "PENDING",
    bankId: "BANK_HDFC",
    bankName: "HDFC Bank",
    requestDate: new Date("2025-01-16")
  },

  // Rejected Loans
  {
    requestId: "LN_008",
    landId: "LAND_014",
    surveyNumber: "SV_2024_014",
    applicantId: "USR_CIT_008", // Venkat Rao
    applicantName: "Venkat Rao",
    applicantAadhaar: "910874478881",
    requestedAmount: 6000000,
    purpose: "Business Setup",
    status: "REJECTED",
    bankId: "BANK_SBI",
    bankName: "State Bank of India",
    managerId: "USR_OFF_003", // SBI Bank Manager
    requestDate: new Date("2025-01-10"),
    rejectionReason: "Insufficient documentation provided"
  },
  {
    requestId: "LN_009",
    landId: "LAND_017",
    surveyNumber: "SV_2024_017",
    applicantId: "USR_CIT_010", // Rajesh Gupta
    applicantName: "Rajesh Gupta",
    applicantAadhaar: "212096690003",
    requestedAmount: 3500000,
    purpose: "Property Development",
    status: "REJECTED",
    bankId: "BANK_HDFC",
    bankName: "HDFC Bank",
    managerId: "USR_OFF_004", // HDFC Bank Manager
    requestDate: new Date("2025-01-11"),
    rejectionReason: "Land value too low for requested amount"
  },

  // Cleared Loans
  {
    requestId: "LN_010",
    landId: "LAND_012",
    surveyNumber: "SV_2024_012",
    applicantId: "USR_CIT_007", // Anita Kumari
    applicantName: "Anita Kumari",
    applicantAadhaar: "809763367770",
    requestedAmount: 3000000,
    approvedAmount: 2800000,
    purpose: "Home Construction",
    status: "CLEARED",
    bankId: "BANK_SBI",
    bankName: "State Bank of India",
    managerId: "USR_OFF_003", // SBI Bank Manager
    requestDate: new Date("2025-01-01"),
    approvalDate: new Date("2025-01-02"),
    clearanceDate: new Date("2025-01-14")
  },
  {
    requestId: "LN_011",
    landId: "LAND_018",
    surveyNumber: "SV_2024_018",
    applicantId: "USR_CIT_011", // Sunita Patel
    applicantName: "Sunita Patel",
    applicantAadhaar: "323107701114",
    requestedAmount: 5000000,
    approvedAmount: 4800000,
    purpose: "Agricultural Investment",
    status: "CLEARED",
    bankId: "BANK_HDFC",
    bankName: "HDFC Bank",
    managerId: "USR_OFF_004", // HDFC Bank Manager
    requestDate: new Date("2025-01-03"),
    approvalDate: new Date("2025-01-04"),
    clearanceDate: new Date("2025-01-15")
  },
  {
    requestId: "LN_012",
    landId: "LAND_021",
    surveyNumber: "SV_2024_021",
    applicantId: "USR_CIT_013", // Deepa Nair
    applicantName: "Deepa Nair",
    applicantAadhaar: "545329923336",
    requestedAmount: 4000000,
    approvedAmount: 3800000,
    purpose: "Business Expansion",
    status: "CLEARED",
    bankId: "BANK_SBI",
    bankName: "State Bank of India",
    managerId: "USR_OFF_003", // SBI Bank Manager
    requestDate: new Date("2025-01-06"),
    approvalDate: new Date("2025-01-07"),
    clearanceDate: new Date("2025-01-16")
  }
];