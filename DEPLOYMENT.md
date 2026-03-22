# Chef Gourmet - Deployment Guide for Render

## 📋 Files to Push to Git

### ✅ INCLUDE these files:

```
chefBot/
├── .gitignore                      # Excludes large files
├── render.yaml                     # Render deployment config
├── README.md
├── backend/
│   ├── server.py                   # Main FastAPI app
│   ├── download_model.py           # Downloads model on deployment
│   ├── requirements.txt            # Python dependencies
│   └── models/
│       └── Qwen2.5-0.5B-Instruct/
│           ├── config.json         # Model config (small)
│           ├── generation_config.json
│           ├── tokenizer_config.json
│           ├── tokenizer.json
│           ├── vocab.json
│           └── merges.txt
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        └── index.css
```

### ❌ DO NOT INCLUDE:

- `backend/models/**/*.safetensors` (943MB - too large)
- `backend/models/**/*.gguf` (large model files)
- `backend/venv*/` (virtual environments)
- `frontend/node_modules/` (dependencies)
- `frontend/dist/` (build output)
- `**/__pycache__/` (Python cache)

The `.gitignore` file already excludes these.

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

```bash
cd d:/projects/FoodBot/chefBot

# Check what will be committed
git status

# Add all files (gitignore will exclude large files)
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Push to GitHub
git push origin main
```

### Step 2: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `chefbot-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python download_model.py
     ```
   - **Start Command**:
     ```bash
     uvicorn server:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: Free

5. **Environment Variables** (add in Render):
   - `PYTHON_VERSION` = `3.11.7`

6. Click **"Create Web Service"**

⏱️ **Note**: First deployment takes 10-15 minutes because it downloads the 943MB model.

### Step 3: Deploy Frontend on Render

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `chefbot-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   - `VITE_API_URL` = `https://chefbot-backend.onrender.com`
     (Use your actual backend URL from Step 2)

5. Click **"Create Static Site"**

### Step 4: Update CORS (if needed)

If you get CORS errors, update `backend/server.py` line 11:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chefbot-frontend.onrender.com"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 Alternative: Deploy Using render.yaml

If you included `render.yaml` in your repo:

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically read `render.yaml` and create both services

---

## 📝 Post-Deployment

### Test Your Deployment

1. Visit your frontend URL: `https://chefbot-frontend.onrender.com`
2. Try asking: "What's a quick pasta recipe?"
3. Check backend logs if there are issues

### Update Environment Variables

Frontend `.env.local` (for local development):
```env
VITE_API_URL=http://localhost:8000
```

### Monitor Your Services

- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to paid tier for always-on service

---

## 🐛 Troubleshooting

### Model Download Fails
- Check Render logs: "Download model Qwen/Qwen2.5-0.5B-Instruct..."
- Ensure `huggingface-hub` is in requirements.txt
- Free tier has 512MB RAM; model might need optimization

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` environment variable
- Check CORS settings in backend
- Ensure backend service is running (check Render dashboard)

### Build Timeout
- First deployment may timeout (15 min limit)
- Re-deploy to resume model download
- Consider using smaller model or Docker image

---

## 💰 Cost Estimate

- **Free Tier**: Both services on free tier (750 hours/month each)
- **Paid Tier**: $7/month per service for always-on + more resources

---

## 🎯 Quick Commands

```bash
# Check git status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Update deployment configuration"

# Push to remote
git push origin main
```

After pushing, Render will automatically redeploy your services! 🚀
