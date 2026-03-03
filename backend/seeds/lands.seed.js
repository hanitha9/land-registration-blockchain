module.exports = [
  {
    landId: "LAND_001",
    surveyNumber: "SV_2024_001",
    ownerId: "USR_CIT_001", // Hanitha Ganisetti
    ownerName: "Hanitha Ganisetti",
    ownerAadhaar: "243107701114",
    location: {
      village: "Madhapur",
      district: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      coordinates: { lat: 17.4452, lng: 78.3814 }
    },
    areaSqFt: 2400,
    landType: "Residential",
    marketValue: 5000000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_002",
    surveyNumber: "SV_2024_002",
    ownerId: "USR_CIT_001", // Hanitha Ganisetti
    ownerName: "Hanitha Ganisetti",
    ownerAadhaar: "243107701114",
    location: {
      village: "Gachibowli",
      district: "Hyderabad",
      state: "Telangana",
      pincode: "500032",
      coordinates: { lat: 17.4385, lng: 78.3475 }
    },
    areaSqFt: 1200,
    landType: "Residential",
    marketValue: 3500000,
    currentStatus: "LOCKED",
    isMortgaged: true,
    encumbranceDetails: {
      bankId: "BANK_SBI",
      bankName: "State Bank of India",
      loanId: "LN_001",
      loanAmount: 2500000,
      mortgageDate: new Date("2025-01-05"),
      loanStatus: "APPROVED"
    }
  },
  {
    landId: "LAND_003",
    surveyNumber: "SV_2024_003",
    ownerId: "USR_CIT_001", // Hanitha Ganisetti
    ownerName: "Hanitha Ganisetti",
    ownerAadhaar: "243107701114",
    location: {
      village: "Kondapur",
      district: "Hyderabad",
      state: "Telangana",
      pincode: "500084",
      coordinates: { lat: 17.4713, lng: 78.3583 }
    },
    areaSqFt: 3000,
    landType: "Commercial",
    marketValue: 7500000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_004",
    surveyNumber: "SV_2024_004",
    ownerId: "USR_CIT_002", // Ravi Kumar Sharma
    ownerName: "Ravi Kumar Sharma",
    ownerAadhaar: "354218812225",
    location: {
      village: "Vizag Beach",
      district: "Visakhapatnam",
      state: "Andhra Pradesh",
      pincode: "530003",
      coordinates: { lat: 17.7213, lng: 83.2977 }
    },
    areaSqFt: 5000,
    landType: "Residential",
    marketValue: 12000000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_005",
    surveyNumber: "SV_2024_005",
    ownerId: "USR_CIT_002", // Ravi Kumar Sharma
    ownerName: "Ravi Kumar Sharma",
    ownerAadhaar: "354218812225",
    location: {
      village: "MVP Colony",
      district: "Visakhapatnam",
      state: "Andhra Pradesh",
      pincode: "530012",
      coordinates: { lat: 17.7133, lng: 83.3123 }
    },
    areaSqFt: 1800,
    landType: "Residential",
    marketValue: 4500000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_006",
    surveyNumber: "SV_2024_006",
    ownerId: "USR_CIT_003", // Priya Reddy
    ownerName: "Priya Reddy",
    ownerAadhaar: "465329923336",
    location: {
      village: "Jubilee Hills",
      district: "Hyderabad",
      state: "Telangana",
      pincode: "500033",
      coordinates: { lat: 17.4269, lng: 78.4042 }
    },
    areaSqFt: 4000,
    landType: "Residential",
    marketValue: 20000000,
    currentStatus: "PENDING_TRANSFER",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    },
    pendingTransfer: {
      buyerId: "USR_CIT_008", // Venkat Rao
      buyerName: "Venkat Rao",
      salePrice: 21000000,
      initiatedDate: new Date("2025-01-15")
    }
  },
  {
    landId: "LAND_007",
    surveyNumber: "SV_2024_007",
    ownerId: "USR_CIT_003", // Priya Reddy
    ownerName: "Priya Reddy",
    ownerAadhaar: "465329923336",
    location: {
      village: "Banjara Hills",
      district: "Hyderabad",
      state: "Telangana",
      pincode: "500034",
      coordinates: { lat: 17.4156, lng: 78.4294 }
    },
    areaSqFt: 2200,
    landType: "Residential",
    marketValue: 9000000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_008",
    surveyNumber: "SV_2024_008",
    ownerId: "USR_CIT_004", // Arun Krishnan
    ownerName: "Arun Krishnan",
    ownerAadhaar: "576430034447",
    location: {
      village: "Vijayawada",
      district: "Krishna",
      state: "Andhra Pradesh",
      pincode: "520001",
      coordinates: { lat: 16.5062, lng: 80.6489 }
    },
    areaSqFt: 3500,
    landType: "Agricultural",
    marketValue: 6500000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_009",
    surveyNumber: "SV_2024_009",
    ownerId: "USR_CIT_005", // Lakshmi Devi
    ownerName: "Lakshmi Devi",
    ownerAadhaar: "687541145558",
    location: {
      village: "Guntur",
      district: "Guntur",
      state: "Andhra Pradesh",
      pincode: "522001",
      coordinates: { lat: 16.3067, lng: 80.4365 }
    },
    areaSqFt: 2800,
    landType: "Agricultural",
    marketValue: 5500000,
    currentStatus: "DISPUTED",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_010",
    surveyNumber: "SV_2024_010",
    ownerId: "USR_CIT_005", // Lakshmi Devi
    ownerName: "Lakshmi Devi",
    ownerAadhaar: "687541145558",
    location: {
      village: "Tenali",
      district: "Guntur",
      state: "Andhra Pradesh",
      pincode: "524101",
      coordinates: { lat: 16.2456, lng: 80.6447 }
    },
    areaSqFt: 1500,
    landType: "Residential",
    marketValue: 3000000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_011",
    surveyNumber: "SV_2024_011",
    ownerId: "USR_CIT_006", // Suresh Babu
    ownerName: "Suresh Babu",
    ownerAadhaar: "798652256669",
    location: {
      village: "Kukatpally",
      district: "Hyderabad",
      state: "Telangana",
      pincode: "500072",
      coordinates: { lat: 17.4845, lng: 78.4132 }
    },
    areaSqFt: 2000,
    landType: "Residential",
    marketValue: 6000000,
    currentStatus: "LOCKED",
    isMortgaged: true,
    encumbranceDetails: {
      bankId: "BANK_HDFC",
      bankName: "HDFC Bank",
      loanId: "LN_002",
      loanAmount: 4000000,
      mortgageDate: new Date("2025-01-07"),
      loanStatus: "APPROVED"
    }
  },
  {
    landId: "LAND_012",
    surveyNumber: "SV_2024_012",
    ownerId: "USR_CIT_007", // Anita Kumari
    ownerName: "Anita Kumari",
    ownerAadhaar: "809763367770",
    location: {
      village: "Secunderabad",
      district: "Medchal",
      state: "Telangana",
      pincode: "500003",
      coordinates: { lat: 17.4399, lng: 78.4983 }
    },
    areaSqFt: 1800,
    landType: "Residential",
    marketValue: 4200000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_013",
    surveyNumber: "SV_2024_013",
    ownerId: "USR_CIT_007", // Anita Kumari
    ownerName: "Anita Kumari",
    ownerAadhaar: "809763367770",
    location: {
      village: "Malkajgiri",
      district: "Medchal",
      state: "Telangana",
      pincode: "500047",
      coordinates: { lat: 17.4443, lng: 78.5256 }
    },
    areaSqFt: 2600,
    landType: "Commercial",
    marketValue: 5800000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_014",
    surveyNumber: "SV_2024_014",
    ownerId: "USR_CIT_008", // Venkat Rao
    ownerName: "Venkat Rao",
    ownerAadhaar: "910874478881",
    location: {
      village: "Tirupati",
      district: "Chittoor",
      state: "Andhra Pradesh",
      pincode: "517501",
      coordinates: { lat: 13.6288, lng: 79.4192 }
    },
    areaSqFt: 4200,
    landType: "Agricultural",
    marketValue: 8500000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_015",
    surveyNumber: "SV_2024_015",
    ownerId: "USR_CIT_009", // Meera Singh
    ownerName: "Meera Singh",
    ownerAadhaar: "101985589992",
    location: {
      village: "Nellore",
      district: "Sri Potti Sri Ramulu Nellore",
      state: "Andhra Pradesh",
      pincode: "524001",
      coordinates: { lat: 14.4426, lng: 79.9865 }
    },
    areaSqFt: 3200,
    landType: "Residential",
    marketValue: 4800000,
    currentStatus: "PENDING_TRANSFER",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    },
    pendingTransfer: {
      buyerId: "USR_CIT_010", // Rajesh Gupta
      buyerName: "Rajesh Gupta",
      salePrice: 5200000,
      initiatedDate: new Date("2025-01-16")
    }
  },
  {
    landId: "LAND_016",
    surveyNumber: "SV_2024_016",
    ownerId: "USR_CIT_009", // Meera Singh
    ownerName: "Meera Singh",
    ownerAadhaar: "101985589992",
    location: {
      village: "Ongole",
      district: "Prakasam",
      state: "Andhra Pradesh",
      pincode: "523001",
      coordinates: { lat: 15.5036, lng: 80.0443 }
    },
    areaSqFt: 2100,
    landType: "Residential",
    marketValue: 3800000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_017",
    surveyNumber: "SV_2024_017",
    ownerId: "USR_CIT_010", // Rajesh Gupta
    ownerName: "Rajesh Gupta",
    ownerAadhaar: "212096690003",
    location: {
      village: "Warangal",
      district: "Warangal",
      state: "Telangana",
      pincode: "506001",
      coordinates: { lat: 17.9715, lng: 79.5997 }
    },
    areaSqFt: 2900,
    landType: "Commercial",
    marketValue: 5200000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_018",
    surveyNumber: "SV_2024_018",
    ownerId: "USR_CIT_011", // Sunita Patel
    ownerName: "Sunita Patel",
    ownerAadhaar: "323107701114",
    location: {
      village: "Karimnagar",
      district: "Karimnagar",
      state: "Telangana",
      pincode: "505001",
      coordinates: { lat: 18.4386, lng: 79.1288 }
    },
    areaSqFt: 3600,
    landType: "Agricultural",
    marketValue: 6800000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_019",
    surveyNumber: "SV_2024_019",
    ownerId: "USR_CIT_011", // Sunita Patel
    ownerName: "Sunita Patel",
    ownerAadhaar: "323107701114",
    location: {
      village: "Nizamabad",
      district: "Nizamabad",
      state: "Telangana",
      pincode: "503001",
      coordinates: { lat: 18.6731, lng: 78.0944 }
    },
    areaSqFt: 1900,
    landType: "Residential",
    marketValue: 3500000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_020",
    surveyNumber: "SV_2024_020",
    ownerId: "USR_CIT_012", // Kiran Kumar
    ownerName: "Kiran Kumar",
    ownerAadhaar: "434218812225",
    location: {
      village: "Khammam",
      district: "Khammam",
      state: "Telangana",
      pincode: "507001",
      coordinates: { lat: 17.2476, lng: 80.1491 }
    },
    areaSqFt: 2500,
    landType: "Commercial",
    marketValue: 4700000,
    currentStatus: "LOCKED",
    isMortgaged: true,
    encumbranceDetails: {
      bankId: "BANK_SBI",
      bankName: "State Bank of India",
      loanId: "LN_003",
      loanAmount: 3000000,
      mortgageDate: new Date("2025-01-08"),
      loanStatus: "APPROVED"
    }
  },
  {
    landId: "LAND_021",
    surveyNumber: "SV_2024_021",
    ownerId: "USR_CIT_013", // Deepa Nair
    ownerName: "Deepa Nair",
    ownerAadhaar: "545329923336",
    location: {
      village: "Rajahmundry",
      district: "East Godavari",
      state: "Andhra Pradesh",
      pincode: "533101",
      coordinates: { lat: 16.9891, lng: 81.7753 }
    },
    areaSqFt: 3100,
    landType: "Agricultural",
    marketValue: 6200000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_022",
    surveyNumber: "SV_2024_022",
    ownerId: "USR_CIT_013", // Deepa Nair
    ownerName: "Deepa Nair",
    ownerAadhaar: "545329923336",
    location: {
      village: "Kakinada",
      district: "East Godavari",
      state: "Andhra Pradesh",
      pincode: "533001",
      coordinates: { lat: 16.9491, lng: 82.2349 }
    },
    areaSqFt: 2300,
    landType: "Residential",
    marketValue: 4400000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_023",
    surveyNumber: "SV_2024_023",
    ownerId: "USR_CIT_014", // Ramesh Choudhary
    ownerName: "Ramesh Choudhary",
    ownerAadhaar: "656430034447",
    location: {
      village: "Anantapur",
      district: "Anantapur",
      state: "Andhra Pradesh",
      pincode: "515001",
      coordinates: { lat: 14.6819, lng: 77.6005 }
    },
    areaSqFt: 4500,
    landType: "Agricultural",
    marketValue: 7200000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_024",
    surveyNumber: "SV_2024_024",
    ownerId: "USR_CIT_015", // Kavitha Reddy
    ownerName: "Kavitha Reddy",
    ownerAadhaar: "767541145558",
    location: {
      village: "Kurnool",
      district: "Kurnool",
      state: "Andhra Pradesh",
      pincode: "518001",
      coordinates: { lat: 15.8288, lng: 78.036 }
    },
    areaSqFt: 2700,
    landType: "Residential",
    marketValue: 5100000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  },
  {
    landId: "LAND_025",
    surveyNumber: "SV_2024_025",
    ownerId: "USR_CIT_015", // Kavitha Reddy
    ownerName: "Kavitha Reddy",
    ownerAadhaar: "767541145558",
    location: {
      village: "Kadapa",
      district: "YSR Kadapa",
      state: "Andhra Pradesh",
      pincode: "516001",
      coordinates: { lat: 14.4747, lng: 78.8238 }
    },
    areaSqFt: 1600,
    landType: "Residential",
    marketValue: 3200000,
    currentStatus: "ACTIVE",
    isMortgaged: false,
    encumbranceDetails: {
      bankId: null,
      bankName: null,
      loanId: null,
      loanAmount: 0,
      loanStatus: "NONE"
    }
  }
];