# Qadir Class Registration System

## Overview
This project implements a decentralized class registration system using a smart contract on the Ethereum blockchain. The system allows an admin to register and manage students while enabling users to retrieve student details.

## Features
- **Admin Role**: The contract has a single admin who manages student enrollments.
- **Student Registration**: The admin can register students with a unique ID and name.
- **Student Removal**: The admin can remove students from the registry.
- **Student Query**: Any user can retrieve a list of registered students or query a student by ID.
- **Web3 Integration**: The frontend interacts with the smart contract using Web3.

## Smart Contract Functions
- `registerStudent(uint256 studentId, string memory studentName)`: Registers a student (Admin only).
- `removeStudent(uint256 studentId)`: Removes a student (Admin only).
- `getStudent(uint256 studentId)`: Retrieves student details by ID.
- `getAllStudentIds()`: Returns all registered student IDs.

## Tech Stack
- **Smart Contract**: Solidity, Ethereum
- **Frontend**: React, Tailwind CSS
- **Blockchain Interaction**: Ethers.js, MetaMask
- **Notifications**: React Toastify

## Setup Instructions
### 1. Clone the Repository
```bash
git clone https://https://github.com/Etz-Hola/SchoolManagement/
cd client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Smart Contract
Update `config/contract.js` with your deployed smart contract address and ABI.

### 4. Run the Project
```bash
npm start
```

## Usage
1. **Connect Wallet**: Click "Connect Wallet" to interact with the blockchain.
2. **Admin Actions**:
   - Register a student by entering ID and name, then clicking "Register".
   - Remove a student by clicking "Remove" next to their name.
3. **User Actions**:
   - View all registered students.
   - Search for a student using their ID.

## Admin Address
The designated admin is hardcoded in the frontend (`ADMIN_ADDRESS`). Only the admin can register or remove students.

## License
This project is licensed under the MIT License.

## Contact
For any inquiries, reach out to.

## Name: `Qadir Adesoye`

## Email: `qadiradesoye@gmai.com` 

## Or create an issue in the repository.


