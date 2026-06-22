# Timer UI Testing Instructions

## Changes Made

### 1. **Removed Click-Through**
   - Timer window is now always interactive
   - No more click-through functionality

### 2. **Fixed Dashboard**
   - Removed `-webkit-app-region: drag` from body
   - All buttons are now clickable
   - Added console logging for debugging

### 3. **Added DevTools**
   - Both Timer and Dashboard now open DevTools automatically
   - You can see console logs to debug issues

### 4. **Improved Event Handling**
   - Better drag detection (5px threshold)
   - Fixed button click handlers
   - Added extensive console logging

## How to Test

### Step 1: Restart the Electron App
```cmd
cd d:\PROJECTS\ONGOING\Meow
npm start
```
or if you have a different start command, use that.

### Step 2: Open Dashboard
- Right-click the tray icon
- Click "🎯 Focus Dashboard"
- DevTools should open automatically

### Step 3: Test Dashboard Buttons
In the Dashboard DevTools Console, you should see:
- Click "Start Focus" → Console: "Start Focus button clicked" and "Focus started"
- Timer overlay should appear at the top of screen
- Click "Stop Focus" → Console: "Stop Focus button clicked" and "Focus stopped"

### Step 4: Test Timer Overlay
The timer overlay DevTools should also be open. Test:
1. **Hover over buttons** - they should highlight
2. **Click Play button** - Console should show: "Play/Pause clicked, isPaused: true" and "Starting timer..."
3. **Timer should count up** - 00:00, 00:01, 00:02...
4. **Click Pause** - Timer should stop
5. **Click Reset** - Timer should go back to 00:00
6. **Drag the notch** - Click and drag the black notch area (not the buttons) to move it

### Step 5: Check for Errors
Look in both DevTools consoles for:
- ❌ Red error messages
- ⚠️ Yellow warnings
- Any messages about "electronAPI is undefined"

## Common Issues

### If buttons don't respond:
1. Check DevTools console for errors
2. Verify `electronAPI` is defined: Type `window.electronAPI` in console
3. Check if click events are firing: Look for console.log messages

### If timer doesn't appear:
1. Check main process console (terminal where you ran npm start)
2. Look for "✅ Timer overlay created" message
3. Check for any errors about window creation

### If dragging doesn't work:
1. Make sure you're clicking on the black notch area, NOT the buttons
2. Try dragging with a larger movement (>5 pixels)
3. Check console for "Started dragging" message

## To Remove DevTools (After Testing)

Once everything works, edit `main.js` and remove these lines:
- Line in `createTimerOverlay()`: `timerOverlay.webContents.openDevTools({ mode: 'detach' });`
- Line in `createDashboardWindow()`: `dashboardWindow.webContents.openDevTools({ mode: 'detach' });`
