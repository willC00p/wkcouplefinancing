# Quick Start Guide

## One-Line Setup

### **Windows (PowerShell)** - All Servers Running

```powershell
# Terminal 1: Backend
cd server; npm install; npm start

# Terminal 2: Frontend (in new terminal)
cd client; npm install; npm start
```

---

## Step-by-Step Setup (Windows)

### Step 1: Open Terminal 1 for Backend

```bash
cd server
npm install
npm start
```

**Expected output:**
```
Connected to SQLite database
Database schema initialized
Server is running on http://localhost:5000
```

### Step 2: Open Terminal 2 for Frontend

```bash
cd client
npm install
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view couple-finance-tracker-client in the browser.
...
Local:            http://localhost:3000
```

### Step 3: Access the App

Open your browser to: **http://localhost:3000**

---

## Quick Test Flow

1. **Navigate to Dashboard**
   - See the empty summary cards

2. **Go to Expenses**
   - Add an expense:
     - Date: Today
     - Description: "Test Expense"
     - Deadline: Next week
     - Amount: $100
     - Paid By: Wayne

3. **Go to Contributions**
   - Add a contribution:
     - Payer: Wayne
     - Amount: $200
     - Participants: Wayne, Kyla (auto-splits to $100 each)

4. **Back to Dashboard**
   - See totals updated
   - Outstanding balance shown

---

## Common Issues

### "Cannot find module 'express'"
```bash
# Make sure you're in server directory
cd server
npm install
```

### Port 3000 already in use
```bash
# Windows PowerShell - kill process on port 3000
Get-Process | Where-Object {$_.Handles -gt 1000} | Stop-Process -Force
```

### "Proxy failed to proxy" errors
- Make sure backend is running on port 5000
- Check package.json has: `"proxy": "http://localhost:5000"`

---

## File Locations

| Component | Location | Details |
|-----------|----------|---------|
| Backend Server | `server/server.js` | Runs on port 5000 |
| Database | `server/finance.db` | SQLite (auto-created) |
| Frontend App | `client/src/App.js` | Main React component |
| API Routes | `server/routes/` | All API endpoints |
| React Components | `client/src/components/` | UI components |

---

## Keyboard Shortcuts

- `Ctrl+C` - Stop server in terminal
- `Ctrl+Shift+Delete` - Clear browser cache (if issues)

---

## Next Steps

Once running:
1. Add some test expenses
2. Update status to "partial" and mark as paid
3. Create contributions and update payments
4. View the dashboard to see summaries
5. Explore the responsive design on mobile (F12 → Toggle Device)

---

**Enjoy tracking your finances together! 💰**
