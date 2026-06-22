const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Original Meow tracking
  onActivity: (callback) =>
    ipcRenderer.on("activity", (_, data) => callback(data)),

  // FocusSync - QR & phone pairing
  getQrData: () => ipcRenderer.invoke("get-qr-data"),

  // FocusSync - Call handling
  sendCallAction: (action) => ipcRenderer.send("call-action", action),
  onIncomingCall: (callback) => {
    ipcRenderer.on("incoming-call", (_event, value) => callback(value));
  },

  // FocusSync - Timer overlay
  moveTimerWindow: (x) => ipcRenderer.send("move-timer-window", x),
  getTimerPosition: () => ipcRenderer.invoke("get-timer-position"),
  timerDragStart: () => ipcRenderer.send("timer-drag-start"),
  timerDragEnd: () => ipcRenderer.send("timer-drag-end"),
  setIgnoreMouseEvents: (ignore, options) =>
    ipcRenderer.send("set-ignore-mouse-events", ignore, options),
  
  // Timer Sync
  sendTimerAction: (action) => ipcRenderer.send("timer-action", action),
  onTimerStateUpdate: (callback) => {
    ipcRenderer.on("timer-state-update", (_event, state) => callback(state));
  },

  // FocusSync - Focus session
  startFocus: () => ipcRenderer.send("start-focus"),
  stopFocus: () => ipcRenderer.send("stop-focus"),
  restartFocus: () => ipcRenderer.send("restart-focus"),
  getFocusStatus: () => ipcRenderer.invoke("get-focus-status"),
});