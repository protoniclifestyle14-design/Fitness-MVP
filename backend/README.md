# Protonic Fitness Backend

Production-ready backend API for Protonic Fitness application.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in:
- `DATABASE_URL` - Your Supabase connection string
- `JWT_ACCESS_SECRET` - Random secret string
- `JWT_REFRESH_SECRET` - Different random secret string
- `JWT_RESET_SECRET` - Another different random secret string

### 3. Set Up Database

1. Go to Supabase SQL Editor
2. Copy contents of `database-schema.sql`
3. Paste and run in SQL Editor

### 4. Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:4000

## 🧪 Test the API

### Register User
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User (Protected Route)
```bash
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login user |
| POST | /auth/refresh | No | Refresh access token |
| POST | /auth/logout | No | Logout user |
| POST | /auth/forgot-password | No | Request password reset |
| POST | /auth/reset-password | No | Reset password |
| GET | /auth/me | Yes | Get current user |
| GET | /health | No | Health check |

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## 🌍 Environment Variables

See `.env.example` for all required environment variables.

## 📦 Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL (Supabase)
- JWT Authentication
- bcrypt for password hashing

## 🔐 Security Features

- Helmet.js for security headers
- Rate limiting
- JWT token rotation
- Password hashing with bcrypt
- SQL injection protection
- CORS configuration
```

---

## 🎯 SETUP INSTRUCTIONS

### Step 1: Create Folder & Copy Files

1. Create a folder called `protonic-backend` on your computer
2. Copy each file above into the correct location following the folder structure

### Step 2: Open Terminal in That Folder

```bash
cd protonic-backend
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Create .env File

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` with:
   ```
   postgresql://postgres.qlscjsvliwrerdpuwxev:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   Replace `YOUR_PASSWORD` with your actual Supabase password

### Step 5: Run Database Schema

1. Go to Supabase → SQL Editor
2. Copy `database-schema.sql` content
3. Paste and run

### Step 6: Start Server

```bash
npm run dev
```

---

## ✅ YOU NOW HAVE A COMPLETE BACKEND!

Everything is organized and ready to use!