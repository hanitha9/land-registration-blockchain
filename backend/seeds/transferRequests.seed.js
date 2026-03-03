module.exports = [
  // Pending Transfers
  {
    transferId: "TR_001",
    landId: "LAND_006",
    surveyNumber: "SV_2024_006",
    sellerId: "USR_CIT_003", // Priya Reddy
    sellerName: "Priya Reddy",
    sellerAadhaar: "465329923336",
    buyerId: "USR_CIT_008", // Venkat Rao
    buyerName: "Venkat Rao",
    buyerAadhaar: "910874478881",
    salePrice: 21000000,
    status: "PENDING",
    initiatedDate: new Date("2025-01-15")
  },
  {
    transferId: "TR_002",
    landId: "LAND_015",
    surveyNumber: "SV_2024_015",
    sellerId: "USR_CIT_009", // Meera Singh
    sellerName: "Meera Singh",
    sellerAadhaar: "101985589992",
    buyerId: "USR_CIT_010", // Rajesh Gupta
    buyerName: "Rajesh Gupta",
    buyerAadhaar: "212096690003",
    salePrice: 5200000,
    status: "PENDING",
    initiatedDate: new Date("2025-01-16")
  },
  {
    transferId: "TR_003",
    landId: "LAND_007",
    surveyNumber: "SV_2024_007",
    sellerId: "USR_CIT_003", // Priya Reddy
    sellerName: "Priya Reddy",
    sellerAadhaar: "465329923336",
    buyerId: "USR_CIT_007", // Anita Kumari
    buyerName: "Anita Kumari",
    buyerAadhaar: "809763367770",
    salePrice: 9500000,
    status: "PENDING",
    initiatedDate: new Date("2025-01-17")
  },

  // Blocked Transfers (Fraud Prevention Demo)
  {
    transferId: "TR_004",
    landId: "LAND_002",
    surveyNumber: "SV_2024_002",
    sellerId: "USR_CIT_001", // Hanitha Ganisetti
    sellerName: "Hanitha Ganisetti",
    sellerAadhaar: "243107701114",
    buyerId: "USR_CIT_006", // Suresh Babu
    buyerName: "Suresh Babu",
    buyerAadhaar: "798652256669",
    salePrice: 4000000,
    status: "BLOCKED",
    blockReason: "Land has active mortgage with State Bank of India",
    initiatedDate: new Date("2025-01-10")
  },
  {
    transferId: "TR_005",
    landId: "LAND_011",
    surveyNumber: "SV_2024_011",
    sellerId: "USR_CIT_006", // Suresh Babu
    sellerName: "Suresh Babu",
    sellerAadhaar: "798652256669",
    buyerId: "USR_CIT_012", // Kiran Kumar
    buyerName: "Kiran Kumar",
    buyerAadhaar: "434218812225",
    salePrice: 6500000,
    status: "BLOCKED",
    blockReason: "Land has active mortgage with HDFC Bank",
    initiatedDate: new Date("2025-01-12")
  },
  {
    transferId: "TR_008",
    landId: "LAND_009",
    surveyNumber: "SV_2024_009",
    sellerId: "USR_CIT_005", // Lakshmi Devi
    sellerName: "Lakshmi Devi",
    sellerAadhaar: "687541145558",
    buyerId: "USR_CIT_015", // Kavitha Reddy
    buyerName: "Kavitha Reddy",
    buyerAadhaar: "767541145558",
    salePrice: 5800000,
    status: "BLOCKED",
    blockReason: "Land is disputed",
    initiatedDate: new Date("2025-01-14")
  },

  // Approved Transfers (Completed)
  {
    transferId: "TR_006",
    landId: "LAND_012",
    surveyNumber: "SV_2024_012",
    sellerId: "USR_CIT_007", // Anita Kumari
    sellerName: "Anita Kumari",
    sellerAadhaar: "809763367770",
    buyerId: "USR_CIT_013", // Deepa Nair
    buyerName: "Deepa Nair",
    buyerAadhaar: "545329923336",
    salePrice: 4500000,
    status: "APPROVED",
    registrarId: "USR_OFF_005", // Sub-Registrar
    initiatedDate: new Date("2025-01-05"),
    completedDate: new Date("2025-01-08")
  },
  {
    transferId: "TR_007",
    landId: "LAND_018",
    surveyNumber: "SV_2024_018",
    sellerId: "USR_CIT_011", // Sunita Patel
    sellerName: "Sunita Patel",
    sellerAadhaar: "323107701114",
    buyerId: "USR_CIT_014", // Ramesh Choudhary
    buyerName: "Ramesh Choudhary",
    buyerAadhaar: "656430034447",
    salePrice: 7000000,
    status: "APPROVED",
    registrarId: "USR_OFF_005", // Sub-Registrar
    initiatedDate: new Date("2025-01-06"),
    completedDate: new Date("2025-01-09")
  },
  {
    transferId: "TR_010",
    landId: "LAND_021",
    surveyNumber: "SV_2024_021",
    sellerId: "USR_CIT_013", // Deepa Nair
    sellerName: "Deepa Nair",
    sellerAadhaar: "545329923336",
    buyerId: "USR_CIT_011", // Sunita Patel
    buyerName: "Sunita Patel",
    buyerAadhaar: "323107701114",
    salePrice: 6500000,
    status: "APPROVED",
    registrarId: "USR_OFF_005", // Sub-Registrar
    initiatedDate: new Date("2025-01-07"),
    completedDate: new Date("2025-01-10")
  },

  // Rejected Transfers
  {
    transferId: "TR_009",
    landId: "LAND_017",
    surveyNumber: "SV_2024_017",
    sellerId: "USR_CIT_010", // Rajesh Gupta
    sellerName: "Rajesh Gupta",
    sellerAadhaar: "212096690003",
    buyerId: "USR_CIT_003", // Priya Reddy
    buyerName: "Priya Reddy",
    buyerAadhaar: "465329923336",
    salePrice: 5500000,
    status: "REJECTED",
    registrarId: "USR_OFF_005", // Sub-Registrar
    initiatedDate: new Date("2025-01-09"),
    notes: "Document mismatch - buyer's Aadhaar not verified"
  }
];