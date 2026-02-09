# Deployment Guide

## Prerequisites
- [Convex account](https://dashboard.convex.dev) (free tier is fine)
- [Railway account](https://railway.app) (free tier works)
- GitHub account

## Step 1: Push to GitHub

```bash
# Create a new repo on GitHub (empty, no README)
# Then:
cd /root/clawd/mission-control
git remote add origin https://github.com/YOUR_USERNAME/mission-control.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Convex Backend

```bash
cd /root/clawd/mission-control
npx convex dev
```

**This will:**
1. Prompt you to log in to Convex (creates account if needed)
2. Create a new Convex project
3. Deploy your schema and functions
4. Give you a `NEXT_PUBLIC_CONVEX_URL` (save this!)

**Leave it running** while developing locally, or run `npx convex dev --once` to deploy and exit.

Example URL: `https://amazing-animal-123.convex.cloud`

## Step 3: Deploy Frontend to Railway

1. **Go to [railway.app](https://railway.app) and log in**

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub and select `mission-control`

3. **Add Environment Variable:**
   - In Railway dashboard, go to your project
   - Click on the service
   - Go to "Variables" tab
   - Add variable:
     ```
     NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
     ```
   - (Paste the URL from Step 2)

4. **Deploy:**
   - Railway auto-detects Next.js
   - Click "Deploy" (or it deploys automatically)
   - Wait 2-3 minutes

5. **Get URL:**
   - Railway gives you a public URL like `mission-control-production.up.railway.app`
   - Click it to open Mission Control

## Step 4: Seed Initial Data

**Create Optimus Prime in Convex:**

```bash
npx convex run agents:create '{
  "name": "Optimus Prime",
  "role": "Squad Lead",
  "sessionKey": "agent:optimus-prime:main",
  "emoji": "🤖"
}'
```

**Create first task:**

```bash
npx convex run tasks:create '{
  "title": "Ajax Partners Traffic Strategy",
  "description": "Get 100+ qualified eyeballs on Ajax Partners reinsurance content",
  "assigneeIds": []
}'
```

**Check the dashboard** - you should see Optimus Prime and the task!

## Step 5: Integrate Agents

Your agents (like Optimus Prime) need to interact with Convex.

**Install Convex client in your agent code:**

```bash
npm install convex
```

**In agent heartbeat:**

```javascript
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.CONVEX_URL);

// Check for assigned tasks
const tasks = await client.query("tasks:list", { status: "assigned" });

// Post update
await client.mutation("messages:create", {
  taskId: task._id,
  content: "Working on research...",
  fromAgentId: agent._id,
});

// Update status
await client.mutation("tasks:updateStatus", {
  id: task._id,
  status: "in_progress",
});
```

## Troubleshooting

**"NEXT_PUBLIC_CONVEX_URL is not defined"**
- Add it in Railway variables
- Make sure you ran `npx convex dev` and copied the URL
- Restart the Railway deployment after adding env vars

**Build fails on Railway**
- Check build logs in Railway dashboard
- Make sure all dependencies are in `package.json`
- Try clearing cache and redeploying

**Real-time updates not working**
- Check browser console for WebSocket errors
- Verify Convex URL is correct
- Check Convex dashboard to see if functions are deployed

**Can't see agents/tasks**
- Run the seed commands from Step 4
- Check Convex dashboard → Data tab to see if data exists
- Verify queries are working in Convex dashboard

## Updating

**Push changes:**

```bash
git add -A
git commit -m "Updated UI"
git push
```

Railway auto-deploys on push to `main`.

**Update Convex schema/functions:**

```bash
npx convex dev
# Or for one-time deploy:
npx convex dev --once
```

## Cost

- **Convex:** Free tier = 1M function calls/month (more than enough)
- **Railway:** Free tier = $5 credit/month (~500 hours)

Both should stay free for development/testing.

---

**You're live!** 🎉

Open your Railway URL and watch agents coordinate in real-time.
