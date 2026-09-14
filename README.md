# MG Solutions — ERP / EMS System

Employee & Project Management System built for MG Solutions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (free) |
| Auth | JWT + bcrypt |

---

## Setup Instructions

### Step 1 — MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com and create a free account
2. Create a free **M0** cluster
3. Under **Database Access** → Add user with password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all)
5. Click **Connect** → **Drivers** → copy the connection string

### Step 2 — Backend Setup

```bash
cd backend
# Edit .env file — replace MONGO_URI with your connection string
# MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/mgsol_erp

npm install
node seed.js        # Creates admin account (run ONCE)
npm run dev         # Start backend on port 5000
```

**Admin Login Credentials (after seeding):**
- Email: `admin@mgsolutions.com`
- Password: `Admin@123`

### Step 3 — Frontend Setup

```bash
cd frontend
npm install
npm run dev         # Start frontend on http://localhost:5173
```

---

## Features

### Admin
- Dashboard with analytics, charts, stats
- Add/Edit/Deactivate employees (auto Employee ID: EMP001, EMP002...)
- Create projects, assign employees with roles
- Create and assign tasks with priority & deadlines
- View all daily reports, mark missing ones, review reports
- Full analytics with department stats, performance radar

### Employee
- Personal dashboard with assigned projects & tasks
- View and update task status
- Submit daily work report (project, hours, blockers, next-day plan)
- View performance analytics with charts

---

## Deployment (Free)

### Backend → Render.com
1. Push backend to GitHub
2. Go to https://render.com → New Web Service
3. Connect GitHub repo
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add environment variables from `.env`

### Frontend → Vercel.com
1. Push frontend to GitHub
2. Go to https://vercel.com → New Project
3. Import frontend folder
4. Add env variable: `VITE_API_URL` = your Render backend URL
5. Deploy

**Update vite.config.js proxy for production** → set `target` to your Render URL.

---

## Employee ID Format

Auto-generated as `EMP001`, `EMP002`, etc. Admin sets the email and password when adding an employee.
