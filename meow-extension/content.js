window.addEventListener("message", (event) => {
  if (event.data.type === "MEOW_GET_DATA") {
    const today = new Date().toISOString().split("T")[0];

    chrome.storage.local.get([today], (result) => {
      window.postMessage({
        type: "MEOW_DATA_RESPONSE",
        payload: result[today] || { sessions: [], totals: {} }
      }, "*");
    });
  }
});