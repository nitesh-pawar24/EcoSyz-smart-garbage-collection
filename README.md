# Garbage Collection Smart System

A comprehensive smart waste management platform featuring modules for households, garbage collection staff, administrators, and super-administrators.

## Project Structure

- `backend`: Node.js Express API Server.
- `user-frontend`: Public facing website and Household dashboard (React).
- `admin-frontend`: Dashboard for municipal and local Panchayat administrators (React).
- `super-admin-frontend`: Master dashboard for system super-administrators (React).
- `app-frontend`: Mobile application for on-ground garbage collectors (React Native / Expo).

## How to Run the System Locally

**Prerequisites:** Node.js (v18+)

You will need to open terminal windows for each component and run the following commands:

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run dev
```

### 2. Start the User/Household Frontend

```bash
cd user-frontend
npm install
npm run dev
```

### 3. Start the Admin Frontend

```bash
cd admin-frontend
npm install
npm run dev
```

### 4. Start the Super Admin Frontend

```bash
cd super-admin-frontend
npm install
npm run dev
```

### 5. Start the Labour Mobile App

```bash
cd app-frontend
npm install
npm run web  # Or run on an emulator via `npx expo start`
```

---

## Examiner Test Login Credentials

To evaluate the system, please use the following credentials for the respective portals:

### Super Admin Portal (Master Control)

- **Portal**: [Super Admin Frontend]
- **Phone**: `1111111111`
- **OTP**: The OTP will be shown in a popup on your screen.

### Admin Portal (Panchayat Management)

- **Portal**: [Admin Frontend]
- **Phone**: `9222222222`
- **OTP**: Provide any simple testing OTP (e.g. `123456`) if prompted, or check the backend console logs.

### Household User Portal (Citizen Dashboard)

- **Portal**: [User Frontend]
- **Phone 1**: `9333333333`
- **Phone 2**: `9444444444`
- **OTP**: Provide any simple testing OTP (e.g. `123456`) if prompted, or check the backend console logs.

### Labour Mobile App (Garbage Collector App)

- **Portal**: [App Frontend]
- **Phone 1**: `9876543210`
- **OTP**: Provide any simple testing OTP (e.g. `123456`) if prompted, or check the backend console logs.

> **Note:** All logins use OTP (One-Time Password) based authentication. During local testing, the OTP may be printed directly in the backend terminal console. Ensure the backend server is running to view these testing OTPs.
