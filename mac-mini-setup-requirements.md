# Mac Mini Setup Requirements for DealPack Automation

**To:** corey@ifinancememphis.com  
**From:** Iris (via Clawdbot)  
**Subject:** Mac Mini Setup Requirements for DealPack Automation

---

Hey Corey,

Here's what needs to be configured on the Mac Mini for New Buy Agent to automate DealPack entry via Remote Desktop:

## **1. Auto-Login**
**System Settings → Users & Groups → Automatic login → Select your account**

(Ensures Mac boots straight to your session, no login screen)

## **2. Disable Lock Screen**
**System Settings → Lock Screen:**
- Turn off "Require password after screen saver begins"
- Set "Start Screen Saver when inactive" to **Never**

## **3. Energy Settings**
**System Settings → Energy:**
- Prevent Mac from sleeping (set to **Never**)
- Uncheck "Put hard disks to sleep when possible"

## **4. Screen Recording Permission**
**System Settings → Privacy & Security → Screen Recording:**
- Grant permission to **Terminal** (or Clawdbot if it prompts)

## **5. Keep Remote Desktop Connection Saved**
**Microsoft Remote Desktop:**
- Save the **iFinance WS 02** connection with credentials stored (so agent can auto-connect)

---

## **Why This Matters:**
Automation requires an active user session. If the Mac is locked or asleep, the agent can't control the Remote Desktop window to enter vehicles into DealPack.

## **No Monitor Needed:**
The Mac Mini can run headless (no physical display). It just needs to stay powered on, logged in, and unlocked.

---

Let me know once this is configured and we'll test the automation workflow.

— Iris
