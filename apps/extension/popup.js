const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const timerEl = document.getElementById("timer");
const currentUrlEl = document.getElementById("current-url");
const statClicks = document.getElementById("stat-clicks");
const statSnapshots = document.getElementById("stat-snapshots");
const statusPill = document.getElementById("status-pill");
const feedbackEl = document.getElementById("feedback");
const btnPrimary = document.getElementById("btn-primary");
const btnSnapshot = document.getElementById("btn-snapshot");
const btnExport = document.getElementById("btn-export");
const btnSync = document.getElementById("btn-sync");
const btnOpen = document.getElementById("btn-open");
const modeAuto = document.getElementById("mode-auto");
const modeManual = document.getElementById("mode-manual");
const syncStatus = document.getElementById("sync-status");

let currentStatus = null;
let feedbackTimer = null;
let syncTimer = null;

function formatTimer(startedAt) {
  if (!startedAt) return "00:00";
  const diff = Math.max(0, Date.now() - startedAt);
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateUI(status) {
  currentStatus = status;
  const recording = Boolean(status?.recording);
  const counts = status?.counts || { clicks: 0, snapshots: 0 };
  const currentUrl = status?.currentUrl || null;

  statusText.textContent = recording ? "Recording" : "Idle";
  statusIndicator.classList.toggle("rec", recording);
  statusPill.classList.toggle("recording", recording);
  timerEl.textContent = recording ? formatTimer(status?.startedAt) : "00:00";

  if (currentUrl && typeof currentUrl === "string") {
    try {
      const parsed = new URL(currentUrl);
      const display = parsed.pathname && parsed.pathname !== "/" 
        ? `${parsed.hostname}${parsed.pathname}`
        : parsed.hostname;
      currentUrlEl.textContent = display;
    } catch {
      currentUrlEl.textContent = "—";
    }
  } else {
    currentUrlEl.textContent = "—";
  }

  statClicks.textContent = counts.clicks || 0;
  statSnapshots.textContent = counts.snapshots || 0;

  btnPrimary.textContent = recording ? "Stop" : "Start";

  const mode = status?.mode || "auto";
  modeAuto.classList.toggle("active", mode === "auto");
  modeManual.classList.toggle("active", mode === "manual");
}

function setFeedback(message, type = "info") {
  if (!feedbackEl) return;
  feedbackEl.textContent = message;
  feedbackEl.dataset.state = type;
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedbackEl.textContent = "";
    feedbackEl.dataset.state = "idle";
  }, 1600);
}

function setSyncState(state, message) {
  if (!syncStatus || !btnSync) return;
  syncStatus.textContent = message || "";
  syncStatus.dataset.state = state;
  btnSync.dataset.state = state;
  if (state === "syncing") {
    btnSync.textContent = "Syncing...";
  } else {
    btnSync.textContent = "Sync";
  }
  if (syncTimer) clearTimeout(syncTimer);
  if (state === "success" || state === "error") {
    syncTimer = setTimeout(() => {
      syncStatus.textContent = "";
      syncStatus.dataset.state = "idle";
      btnSync.dataset.state = "idle";
    }, 2000);
  }
}

function getStatus() {
  chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
    if (chrome.runtime.lastError) return;
    updateUI(response);
  });
}

btnPrimary.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "TOGGLE_RECORDING" }, () => {
    getStatus();
  });
});

btnSnapshot.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "SNAPSHOT" });
  setFeedback("Snapshot saved", "success");
});

btnExport.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "EXPORT" });
});

btnSync.addEventListener("click", () => {
  setSyncState("syncing", "Syncing...");
  chrome.runtime.sendMessage({ type: "SYNC" }, (response) => {
    if (chrome.runtime.lastError) {
      setSyncState("error", "Sync failed");
      return;
    }
    if (response?.ok) {
      setSyncState("success", "Flow synced");
    } else {
      setSyncState("error", response?.error || "Sync failed");
    }
  });
});

btnOpen.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_EDITOR" });
});

modeAuto.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "SET_MODE", mode: "auto" }, () => {
    getStatus();
  });
});

modeManual.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "SET_MODE", mode: "manual" }, () => {
    getStatus();
  });
});

getStatus();
setInterval(getStatus, 700);
