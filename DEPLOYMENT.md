# Deployment Guide for YouTube AI Creator Studio

This project is a full-stack application with a React frontend (Vite) and an Express backend.

## Deployment Options

### 1. Deploying to Cloud Run (Recommended)
This is the most robust way to deploy the app.
1. Connect your GitHub repository to Google Cloud Build.
2. Use the provided `Dockerfile` (if available) or let Cloud Run detect the Node.js environment.
3. Set the `GEMINI_API_KEY` environment variable in the Cloud Run service settings.

### 2. Deploying to Render / Railway / Heroku
These platforms support Node.js apps out of the box.
1. Connect your GitHub repository.
2. Set the **Build Command**: `npm install && npm run build`
3. Set the **Start Command**: `npm start`
4. Add your `GEMINI_API_KEY` to the environment variables.

### 3. GitHub Pages (Static Only)
**Note:** GitHub Pages only supports static sites. The `server.ts` will not run.
If you want to use GitHub Pages:
1. Build the app: `npm run build`
2. Push the `dist` folder to a `gh-pages` branch.
3. **Limitation:** The `/api/health` route and any future server-side logic will not work.

## Important Note on API Keys
The current implementation uses the Gemini API key on the client side. For production use, it is highly recommended to move API calls to the server to protect your key.

## Troubleshooting
- **Port Error:** The app is configured to use `process.env.PORT || 3000`. Ensure your hosting provider provides a `PORT` variable.
- **Node Version:** Ensure your environment uses Node.js 22+ to support the `--experimental-strip-types` flag in the start script.
