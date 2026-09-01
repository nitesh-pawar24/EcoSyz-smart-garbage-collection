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
- **Phone**: `9111111111`
- **OTP**: The OTP will be shown in a popup on your screen.

### Admin Portal (Panchayat Management)

- **Portal**: [Admin Frontend]
- **Phone**: `9222222222` - chicalim panchayat
- **Phone**: `8322374279` - Mauxi panchayat
- **OTP**: Provide any simple testing OTP (e.g. `123456`) if prompted, or check the backend console logs.

### Household User Portal (Citizen Dashboard)

- **Portal**: [User Frontend]
- **Phone 1**: `9333333333`- chicalim
- **Phone 2**: `9444444444`- chicalim
- **Phone 3**: `9555555555`- chicalim
- **Phone 4**: `9666666666`- mauxi
- **Phone 5**: `9888888888`- mauxi
- **OTP**: Provide any simple testing OTP (e.g. `123456`) if prompted, or check the backend console logs.

### Labour Mobile App (Garbage Collector App)

- **Portal**: [App Frontend]
- **Phone 1**: `9876543210` - chicalim
- **Phone 2**: `9777777777` - mauxi
- **OTP**: Provide any simple testing OTP (e.g. `123456`) if prompted, or check the backend console logs.

> **Note:** All logins use OTP (One-Time Password) based authentication. During local testing, the OTP may be printed directly in the backend terminal console. Ensure the backend server is running to view these testing OTPs.

---

## Environment Variables

Each sub-project requires its own `.env` file. Create these files before running the project locally.

### `backend/.env`

```env
MONGO_URI=mongodb+srv://kamsoftindia_db_user:VFXDqxS3SIH0jBZJ@sgcs.7xchewr.mongodb.net/garbage-collection-db
JWT_SECRET=garbage_collection_secret_2026
PORT=8000
```

### `admin-frontend/.env`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
VITE_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPER_ADMIN_URL=http://localhost:3002
```

### `super-admin-frontend/.env`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
VITE_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000
```

### `user-frontend/.env`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
VITE_API_BASE_URL=http://localhost:8000/api
```

> **Note:** The `app-frontend` (mobile app) uses a `config.js` file instead of `.env`. Update the API base URL there if needed.
