# Railway Build Fix

The build failed because Convex generated files don't exist yet.

## Quick Fix (2 minutes)

### Step 1: Set Up Convex

```bash
cd /root/clawd/mission-control
npx convex dev
```

**This will:**
- Prompt you to log in/sign up for Convex (free)
- Create a Convex project
- Generate the `convex/_generated` files
- Give you `NEXT_PUBLIC_CONVEX_URL`

**Copy that URL** - you'll need it for Railway.

Press **Ctrl+C** after it says "Watching for changes..."

### Step 2: Commit Generated Files

```bash
git add convex/_generated
git commit -m "Add Convex generated files for Railway build"
git push
```

### Step 3: Add Convex URL to Railway

1. Go to your Railway project
2. Click on the service
3. Go to **Variables** tab
4. Add variable:
   ```
   NEXT_PUBLIC_CONVEX_URL=<paste URL from step 1>
   ```
5. Click **Redeploy**

Railway will now build successfully!

---

## Alternative: Use Convex Deploy Key (Production Setup)

If you want Railway to auto-deploy Convex on every build:

1. Get deploy key: `npx convex deploy --cmd 'echo' --preview-create` 
2. Add to Railway variables:
   ```
   CONVEX_DEPLOY_KEY=<your key>
   ```
3. Update `package.json` build script (already done)

This way Convex deploys automatically with each Railway build.
