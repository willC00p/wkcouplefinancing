# Couple Finance Tracker - Deployment Guide

## Overview
This application is production-ready and can be deployed to **Render.com** (free tier) with SQLite database.

## Pre-Deployment Checklist

- [ ] Code pushed to GitHub repository
- [ ] `.env.example` files reviewed and copied as `.env` (keep out of version control)
- [ ] `render.yaml` reviewed and customized if needed
- [ ] Render.com account created (sign up at https://render.com)

## Building for Production

### Step 1: Build React Frontend
```bash
cd client
npm run build
```
This creates an optimized build in `client/build/` directory.

### Step 2: Verify Build
```bash
# From project root, test backend with static files
cd server
npm start
```
Your app should be accessible at `http://localhost:5000`

## Deployment Options

### Option A: Render.com with render.yaml (Recommended)
1. **Connect Repository to Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account and select the repository

2. **Use render.yaml Blueprint**
   - Render will auto-detect `render.yaml` in root directory
   - Click "Deploy"
   - Render will automatically build and deploy both frontend and backend

3. **Persistent Disk Setup (IMPORTANT for Free Tier)**
   The `render.yaml` includes a persistent disk configuration that preserves your database across:
   - Service restarts
   - Redeploys/patches
   - Free tier spindowns (15 min inactivity)
   
   **The disk is automatically configured in render.yaml:**
   - **Mount Path**: `/var/data` (Render's standard persistent location)
   - **Size**: 1GB (sufficient for most use cases)
   - **Name**: `finance-db`
   - **Environment Variable**: `DB_PATH=/var/data` (tells app where to store database)

   **First-time Setup:**
   1. Deploy normally via render.yaml
   2. The persistent disk will be created automatically on first deploy
   3. Your SQLite database will be stored at `/var/data/finance.db`
   4. Verify in Logs that you see: `✓ Database schema initialized`

4. **Set Environment Variables**
   On Render dashboard for your web service:
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://your-service-name.onrender.com` (your actual Render URL)
   - `PORT`: `5000` (optional, Render will assign an available port)
   - `DB_PATH`: `/var/data` (already set in render.yaml, verify it exists)

### Option B: Render.com Manual Deployment

1. **Create Backend Service**
   - New Web Service
   - Connect GitHub repository
   - **Name**: `couple-finance-api`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install && npm run build` (if you add a build script)
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-domain.com
     ```

2. **Create Frontend Service** (Optional - can be part of backend)
   - New Static Site or Web Service
   - Connect GitHub repository
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`

### Option C: Heroku (Legacy Support)

If using Heroku instead of Render:

```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com

# Deploy
git push heroku main
```

## Environment Variables Explained

### Client (`client/.env`)
- **REACT_APP_API_URL**: Backend API base URL (optional, defaults to backend domain)
  - Development: Leave empty or use `http://localhost:5000`
  - Production: Your Render backend URL

### Server (`server/.env`)
- **NODE_ENV**: Set to `production` for deployment
- **PORT**: Server port (Render assigns automatically, defaults to 5000)
- **FRONTEND_URL**: Frontend domain for CORS (e.g., `https://your-app.onrender.com`)
- **DATABASE_URL**: SQLite database path (defaults to `./finance.db`)

## Database Persistence

- **SQLite Database**: Stored at `server/finance.db`
- **Render Free Tier**: Database persists on the service filesystem
- **Important**: The free tier may lose data if the service hibernates or restarts. For production with guaranteed persistence, consider:
  - Render paid tier with persistent storage
  - PostgreSQL add-on (Render or Heroku)
  - Database backups before major updates

## Post-Deployment Steps

1. **Test Application**
   - Navigate to your Render URL
   - Test adding an expense
   - Test adding a contribution
   - Test mobile responsiveness
   - Test charts on dashboard

2. **Monitor Logs**
   - Go to Render dashboard
   - Click on your service
   - View "Logs" tab for any errors

3. **Set Up Auto-Deploy**
   - In `render.yaml` or Render settings, enable auto-deploy on push
   - Next `git push` will automatically redeploy

## Troubleshooting

### "Cannot GET /" error
- Ensure `react-scripts build` has been run
- Check that `client/build/index.html` exists
- Verify server is serving static files from correct path

### API calls fail in production
- Check `FRONTEND_URL` and `REACT_APP_API_URL` environment variables
- Verify CORS settings in `server/server.js`
- Check browser console for exact error URL

### Database queries fail
- Ensure server has write permissions to persistent disk
- Check database file exists at `/var/data/finance.db` in Render logs
- Review `server/server.js` database initialization
- **For data loss issues**: Check if persistent disk is mounted
  - Go to Render Dashboard → Your Web Service → Disks
  - Verify disk "finance-db" exists and is mounted at `/var/data`
  - If no disk shows, you need to manually add it:
    1. Go to Disks tab
    2. Click "New Disk"
    3. Name: `finance-db`
    4. Mount path: `/var/data`
    5. Size: 1GB
    6. Save
    7. Redeploy

### Database being wiped on every deploy/downtime
- **This is your current issue** - likely no persistent disk or incorrect mount path
- **Solution**: Follow the "For data loss issues" section above
- **Verify**: Check `/api/health` endpoint - look for `database.dbPath` showing `/var/data`
- **Test**: Add a test debt/expense, wait 20 minutes for free tier spindown, refresh - data should persist

### Service won't start
- Check `npm install` completed in both client and server
- Review Render logs for specific error
- Verify `start` script exists in `server/package.json`

## Scaling Notes

For higher user traffic beyond Render free tier:
- Implement proper session management
- Consider PostgreSQL instead of SQLite
- Add caching layer (Redis)
- Separate frontend and backend services
- Implement API rate limiting
- Add monitoring/alerting

## Development vs Production

- **Development**: `npm start` runs both servers separately on different ports
- **Production**: Single Node server serves both API and React frontend
- **Database**: Same SQLite used in both environments

## Rollback

If deployment has issues:
1. Render dashboard → Service → Deployments tab
2. Find previous successful deployment
3. Click three dots → "Redeploy"

## Additional Resources

- [Render Documentation](https://docs.render.com)
- [Node.js Deployment Guide](https://nodejs.org/en/docs/guides/nodejs-web-application-deployment/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
- [SQLite Best Practices](https://www.sqlite.org/bestpractice.html)

## Support

For issues:
1. Check Render service logs
2. Review browser console (F12)
3. Check Network tab for API calls
4. Verify all environment variables are set correctly
