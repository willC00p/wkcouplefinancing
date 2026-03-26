# Couple Finance Tracker

A modern, full-stack web application for couples to track shared expenses and financial contributions. Built with React, Node.js, Express, and SQLite.

## Features

✨ **Core Features**
- 💰 Track shared expenses with category support
- 💵 Record financial contributions from both partners
- 📊 Interactive dashboard with visual breakdown charts
- 📱 Mobile-responsive design with adaptive layouts
- 🎨 Modern UI with icon-based navigation
- 🔄 Real-time data updates

✅ **Dashboard**
- Summary statistics (total expenses, contributions)
- Pie charts showing expense breakdown by payer
- Pie charts showing contribution breakdown by contributor
- At-a-glance financial overview

✅ **Expense Tracking**
- Add expenses with amount, category, description, and payer
- View all expenses in table (desktop) or card layout (mobile)
- Edit existing expenses
- Delete expenses
- Real-time balance calculations

✅ **Contribution Tracking**
- Record contributions from each partner
- Manage multiple participants per contribution
- View contribution history in table (desktop) or card layout (mobile)
- Edit and delete contributions
- Track who contributed what amount

✅ **Responsive Design**
- Desktop-optimized table layouts (1024px+)
- Tablet-friendly card views (768px - 1024px)
- Mobile-first card design (<768px)
- Touch-friendly buttons and inputs
- Adaptive navigation

## Tech Stack

**Frontend**
- React 18.2.0 with Hooks
- react-icons for icon set
- recharts for data visualization
- Modern CSS with responsive breakpoints
- No external UI framework - hand-crafted design

**Backend**
- Node.js with Express.js
- SQLite3 database
- RESTful API architecture
- CORS enabled for cross-origin requests
- Production-ready configuration

**Design System**
- Neutral color palette: Blues, greens, grays
- Responsive typography using system fonts
- Smooth transitions and subtle shadows
- Accessibility-first icon usage
- Mobile-first approach

## Database Schema

### expenses
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL,
  category TEXT,
  description TEXT,
  payer TEXT NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### contributions
```sql
CREATE TABLE contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### contribution_participants
```sql
CREATE TABLE contribution_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contribution_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contribution_id) REFERENCES contributions(id) ON DELETE CASCADE
)
```

---

## Getting Started

### Prerequisites
- Node.js 14.0 or higher
- npm or yarn
- Git (for version control)

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/couple-finance-tracker.git
   cd couple-finance-tracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start Backend Server**
   ```bash
   cd ../server
   npm start
   ```
   Server runs on `http://localhost:5000`
   Health check: `http://localhost:5000/api/health`

5. **Start Frontend Development Server** (in new terminal)
   ```bash
   cd client
   npm start
   ```
   App opens at `http://localhost:3000`

6. **Test the Application**
   - Add an expense on the "Expenses" tab
   - Add a contribution on the "Contributions" tab
   - View charts on the "Dashboard" tab
   - Try mobile view (DevTools - responsive mode)

### Environment Configuration

**Frontend (.env or .env.local)**
```
REACT_APP_API_URL=http://localhost:5000
```

**Backend (.env)**
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/summary` - Get financial summary and chart data

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Contributions
- `GET /api/contributions` - List all contributions
- `POST /api/contributions` - Create new contribution
- `PUT /api/contributions/:id` - Update contribution
- `DELETE /api/contributions/:id` - Delete contribution
- `PUT /api/contributions/:id/participants` - Update participant amounts

### Health
- `GET /api/health` - Server health check

## Usage Guide

### Adding an Expense
1. Navigate to "Expenses" tab
2. Enter amount, select category, add description
3. Select who paid for it
4. Click "Add Expense"
5. View in table/cards below

### Adding a Contribution
1. Navigate to "Contributions" tab
2. Enter contribution name (e.g., "Savings", "Vacation Fund")
3. Add each person's contribution amount
4. Click "Add Contribution"
5. Contributions appear in table/cards below

### Editing/Deleting
- **Desktop**: Click edit/delete buttons in table
- **Mobile**: Swipe or tap edit/delete on card
- Changes sync immediately to dashboard

### Viewing Dashboard
- Main dashboard shows key metrics
- Pie charts update based on expense and contribution data
- Green = who paid less, see breakdown by person

---

## Responsive Breakpoints

- **Mobile** (<480px): Full-width cards, stacked layout
- **Tablet** (480px - 768px): 2-column cards, optimized touch targets
- **Laptop** (768px - 1024px): Table view, side navigation
- **Desktop** (1024px+): Full table, expanded sidebar

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | #3b82f6 | Action buttons, headers |
| Success Green | #10b981 | Positive values, contributions |
| Warning Amber | #f59e0b | Warnings, attention |
| Danger Red | #ef4444 | Delete actions, losses |
| Gray Dark | #1a1a1a | Primary text |
| Gray Light | #f9fafb | Backgrounds |

## Performance

- Lightweight: ~50KB gzipped (frontend)
- No heavy dependencies (no Redux, no Material UI)
- Sub-second API responses
- Efficient SQLite queries
- Optimized React rendering with hooks

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers: iOS Safari 12+, Chrome Android 90+

## Deployment

For production deployment to **Render.com** (free tier):

1. **Read** [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
2. **Push** code to GitHub
3. **Connect** repository to Render.com
4. **Set** environment variables
5. **Deploy** - Render auto-builds and runs

See [DEPLOYMENT.md](./DEPLOYMENT.md) for multiple deployment options and troubleshooting.

## Known Limitations

- SQLite on free tier may have performance limits with 1000+ records
- Real-time sync requires page refresh
- No user authentication (assumes partner access on same device)
- Single database instance (no multi-server support)

## Future Enhancements

🚀 Potential features for future versions:
- Multi-user authentication and authorization
- Data export (CSV, PDF reports)
- Budget planning and alerts
- Monthly settlements calculation
- Dark mode toggle
- Data backup and restore
- Monthly/yearly analysis reports
- Receipt image storage

## Contributing

This is a personal/couple project. For improvements:
1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT License - feel free to use and modify

## Support & Issues

- **Development Issues**: Check browser console (F12)
- **Deployment Issues**: Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Database Issues**: Check `server/finance.db` exists and is writable
- **API Issues**: Test endpoints with Postman or curl

---

**Last Updated**: 2024
**Version**: 1.0.0 (Production Ready)
**Status**: ✅ Ready for Deployment
