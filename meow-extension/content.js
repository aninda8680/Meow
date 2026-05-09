window.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "MEOW_GET_DATA") return;

  console.log("📥 Extension received data request from Dashboard");

  const today = new Date().toISOString().split("T")[0];

  // Guard: chrome.runtime becomes invalid when the extension is reloaded
  // or updated while this content script is still injected into the page.
  // Without this, any postMessage from the dashboard causes an uncaught throw.
  try {
    if (!chrome?.runtime?.id) {
      // Extension context is gone — bail silently. The page will get a fresh
      // content script on next navigation or manual reload.
      return;
    }

    chrome.storage.local.get([today], (result) => {
      // Check lastError inside the callback too — the context can die mid-call
      if (chrome.runtime.lastError) return;

      window.postMessage({
        type: "MEOW_DATA_RESPONSE",
        payload: result[today] || { sessions: [], totals: {} }
      }, "*");
    });
  } catch (e) {
    // Swallow — extension context invalidated, nothing we can do from here
  }
});