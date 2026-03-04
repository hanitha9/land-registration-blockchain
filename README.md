# 🏛️ Blockchain-Based Land Registry & Fraud Prevention System

<div align="center">

![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger%20Fabric-v2.5-blue?style=for-the-badge&logo=hyperledger)
![Node.js](https://img.shields.io/badge/Node.js-v18-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Docker-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A fraud-proof, transparent land administration system built on Hyperledger Fabric.**  
Smart contracts physically block illegal transactions in real-time — not just record them after the fact.

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Workflows](#-workflows) • [Demo](#-demo-credentials)

</div>

---

## 🚨 The Problem This Solves

India's traditional land registry has three critical fraud vulnerabilities:

| Problem | Description | Impact |
|---------|-------------|--------|
| **Hidden Liability Trap** | Registrars couldn't see live bank records | Mortgaged land sold to innocent buyers |
| **Mutation Lag** | Time gap between sale registration and revenue record update | Same land sold twice (double-spending) |
| **Manual EC Verification** | Physical Encumbrance Certificates verified manually | Corruption and forgery possible |

This system eliminates all three by replacing disconnected departmental databases with a **single synchronized blockchain ledger**.

---

## ✨ Features

- 🔒 **Active Fraud Prevention** — Smart contracts block illegal transactions before they happen
- 🏦 **Real-time Mortgage Tracking** — Banks lock land on-chain; sale is impossible until loan is cleared
- ⚡ **Auto-Mutation** — Ownership records update instantly on transfer approval (zero mutation lag)
- 🔐 **Role-Based Access** — Citizens, Revenue Officers, Bank Managers, Sub-Registrars each have scoped permissions
- 📱 **KYC Registration** — Aadhaar + PAN verification with OTP authentication
- 📜 **Immutable Audit Trail** — Every transaction timestamped and permanently recorded
- 🌐 **Full Transaction History** — Complete ownership chain queryable at any time

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│         (Citizens, Officers, Bank, Registrar)           │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────┐
│              Node.js + Express Backend                   │
│         JWT Auth │ Role Middleware │ OCR Service         │
└──────┬───────────────────────────────────┬──────────────┘
       │                                   │
┌──────▼──────┐                   ┌────────▼───────┐
│   MongoDB   │                   │  Hyperledger   │
│  (Off-chain │                   │  Fabric v2.5   │
│   metadata) │                   │  (On-chain     │
└─────────────┘                   │   truth)       │
                                  └────────────────┘
                                  Channel: landchannel
                                  Chaincode: landregistry v3.0
                                  Orgs: Org1 + Org2
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Hyperledger Fabric v2.5.14, Raft consensus, LevelDB |
| Chaincode | Node.js (JavaScript) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Docker) |
| Frontend | React 18, Tailwind CSS v3, React Router v6 |
| Auth | JWT, Twilio OTP |
| OCR | OCR.space API + Sharp image processing |
| Infrastructure | Docker + Docker Compose, Ubuntu 24.04 |

---

## 🔐 Fraud Prevention

The critical principle: **Even if the frontend is hacked or the API is bypassed, the blockchain smart contract is the final authority.**

### Scenario 1 — Selling Mortgaged Land ❌ BLOCKED

```
Citizen A → Takes loan → Land LOCKED → Tries to sell to Citizen B

Smart Contract Response:
❌ TRANSFER BLOCKED
Error: "Cannot transfer land with active mortgage"
- Land ID: LAND_101 | Status: LOCKED | Mortgaged To: SBI Bank
```

### Scenario 2 — Double Mortgage ❌ BLOCKED

```
Citizen A → Mortgages land to Bank-1 → Tries to mortgage same land to Bank-2

Smart Contract Response:
❌ LOAN REJECTED
Error: "Land already has active encumbrance"
- Existing Mortgage: SBI Bank | Loan: LN_2024_001 | ₹50,00,000
```

### Scenario 3 — Fake Ownership Claim ❌ BLOCKED

```
Citizen B tries to sell land owned by Citizen A

Smart Contract Response:
❌ SALE REJECTED
Error: "You are not the owner of this land"
- Attempt logged for security investigation
```

### Dual-Layer Protection

```
Layer 1: UI shows warning and blocks the form
Layer 2: Smart contract enforces the rule even if UI/API is bypassed
```

---

## 🔄 Land State Machine

```
          REGISTERED
               ↓
           [ ACTIVE ] ◄──────────────────────────────┐
               │                                      │
               ├──[Bank approves loan]──► LOCKED ─────┘
               │                         (Loan Cleared)
               │
               ├──[Dispute raised]──► DISPUTED
               │
               └──[Registrar approves]──► TRANSFERRED
                                          (New owner gets ACTIVE)
```

---

## 📋 Smart Contract Functions

| Function | Triggered By | Action |
|----------|-------------|--------|
| `createLand` | Revenue Officer | Creates immutable land record |
| `approveLoan` | Bank Manager | Sets `isMortgaged=true`, status=LOCKED |
| `clearLoan` | Bank Manager | Sets `isMortgaged=false`, status=ACTIVE |
| `transferOwnership` | Sub-Registrar | Validates all checks, changes owner, Auto-Mutation |
| `queryLand` | Any authorized role | Reads current land state |
| `getLandHistory` | Any authorized role | Full ownership and transaction history |
| `markDisputed` | Revenue Officer / Sub-Registrar | Flags land as disputed |

---

## 👥 System Roles

| Role | Key Permissions |
|------|----------------|
| **Citizen** | KYC signup, view own lands, apply for loan, initiate sale |
| **Revenue Officer** | Create land records, view all lands, mark disputes |
| **Bank Manager** | Approve/reject loans, clear loans (unlock land) |
| **Sub-Registrar** | Approve/reject land transfers |
| **Admin** | Full access to all operations |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Docker + Docker Compose
- Node.js v18+
- Hyperledger Fabric v2.5 binaries

# Download Fabric binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.4 1.5.7
```

### Phase 1 — Start Fabric Network

```bash
cd network/land-network

# Start network + create channel
./network.sh up createChannel -c landchannel -ca

# Deploy chaincode
./network.sh deployCC \
  -ccn landregistry \
  -ccp ../../chaincode/landregistry \
  -ccl javascript \
  -c landchannel \
  -ccv 2.0 \
  -ccs 1
```

### Phase 2 — Start MongoDB + Seed Data

```bash
docker start mongodb

cd backend
node seeds/seedComplete.js --fresh
```

### Phase 3 — Enroll Wallet Identities

```bash
cd backend
node enrollAdmin.js
node enrollAppUser2.js
node syncToBlockchain.js
```

### Phase 4 — Launch

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm start

# Terminal 2 — Frontend (port 3001)
cd frontend && npm start
```

Open: **http://localhost:3001**

---

### 🔁 Re-enroll Wallet (if "creator org unknown" error)

```bash
cd backend
rm -f wallet/admin.id wallet/appUser.id
node enrollAdmin.js
node registerUser.js
```

---

## 🎭 Demo Credentials

### 🧑‍💻 Citizens (Login with Aadhaar + Password)

| Name | Aadhaar | Password | Best For Demoing |
|------|---------|----------|-----------------|
| **Hanitha Ganisetti** | 243107701114 | Test@1234 | ⭐ Best demo — 3 lands (active, locked, commercial) |
| Priya Reddy | 465329923336 | Test@1234 | Has a pending sale in progress |
| Lakshmi Devi | 687541145558 | Test@1234 | Has a disputed land |
| Kavitha Reddy | 767541145558 | Test@1234 | Has pending loan applications |
| Ravi Kumar Sharma | 354218812225 | Test@1234 | Standard active lands |
| Arun Krishnan | 576430034447 | Test@1234 | Standard active lands |
| Suresh Babu | 798652256669 | Test@1234 | Standard active lands |

### 👔 Officers (Login with Employee ID + Password)

| Role | Employee ID | Password |
|------|-------------|----------|
| Revenue Officer 1 | REV001 | Rev@1234 |
| Revenue Officer 2 | REV002 | Rev@1234 |
| SBI Bank Manager | SBI001 | Bank@1234 |
| HDFC Bank Manager | HDFC001 | Bank@1234 |
| Sub-Registrar | REG001 | Reg@1234 |
| Admin | ADMIN001 | Admin@123 |

---

## 📊 Seed Data Summary

| Category | Count | Details |
|----------|-------|---------|
| Land Records | 25 | 18 ACTIVE, 3 LOCKED, 2 PENDING_TRANSFER, 1 DISPUTED |
| Loan Requests | 12 | 4 PENDING, 3 APPROVED (active mortgages), 3 CLEARED, 2 REJECTED |
| Transfer Requests | 10 | 3 PENDING, 3 BLOCKED by fraud prevention, 3 APPROVED, 1 REJECTED |
| Citizens | 15 | Varied ownership scenarios |
| Officers | 6 | 2 Revenue, 2 Bank Managers, 1 Sub-Registrar, 1 Admin |

---

## 📁 Project Structure

```
land-registry-blockchain/
├── backend/                  # Node.js + Express + MongoDB
│   ├── controllers/          # Route handlers (auth, land, bank, registrar...)
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── services/             # Blockchain, OCR, OTP services
│   ├── seeds/                # Demo data seeders
│   └── wallet/               # Fabric identity wallet (gitignored)
│
├── frontend/                 # React 18 + Tailwind CSS
│   └── src/
│       ├── pages/dashboards/ # Role-specific dashboards
│       ├── pages/land/       # Land operations (loan, sale, register)
│       └── services/         # API service layer
│
├── chaincode/landregistry/   # Hyperledger Fabric smart contracts
│   └── lib/                  # landRegistryContract.js
│
└── network/land-network/     # Fabric network configuration
    ├── network.sh            # Network management script
    ├── compose/              # Docker Compose files
    └── configtx/             # Channel configuration
```

---

## 🔧 Key Configuration

| Setting | Value |
|---------|-------|
| Channel | `landchannel` |
| Chaincode | `landregistry` v3.0, Sequence 2 |
| Peers | `peer0.org1.example.com:7051`, `peer0.org2.example.com:9051` |
| Orderer | `orderer.example.com:7050` |
| Docker Network | `fabric_test` |
| Backend Port | `5000` |
| Frontend Port | `3001` |

---

## 🛡️ Security

| Threat | Protection |
|--------|-----------|
| Selling mortgaged land | Smart contract LOCKED status check |
| Double mortgage | `isMortgaged` flag on-chain |
| Fake ownership | Caller identity vs on-chain owner validation |
| UI/API bypass | Blockchain is the final enforcement layer |
| Data tampering | Immutable distributed ledger |
| Unauthorized access | Role-based JWT authentication |
| Backdated records | Blockchain timestamps |

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
Built with ❤️ using Hyperledger Fabric — where fraud prevention is enforced at the ledger level.
</div>
