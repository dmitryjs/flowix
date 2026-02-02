const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const timerEl = document.getElementById("timer");
const currentUrlEl = document.getElementById("current-url");
const statScreenshots = document.getElementById("stat-screenshots");
const statClicks = document.getElementById("stat-clicks");
const statSnapshots = document.getElementById("stat-snapshots");
const shortcutToggle = document.getElementById("shortcut-toggle");
const shortcutExport = document.getElementById("shortcut-export");
const btnPrimary = document.getElementById("btn-primary");
const btnSnapshot = document.getElementById("btn-snapshot");
const btnExport = document.getElementById("btn-export");
const btnSync = document.getElementById("btn-sync");
const btnOpen = document.getElementById("btn-open");
const modeAuto = document.getElementById("mode-auto");
const modeManual = document.getElementById("mode-manual");
const syncStatus = document.getElementById("sync-status");

let currentStatus = null;

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
  const shortcuts = status?.shortcuts || {};
  const currentUrl = status?.currentUrl || null;

  statusText.textContent = recording ? "REC" : "IDLE";
  statusIndicator.classList.toggle("rec", recording);
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

  statScreenshots.textContent = counts.snapshots || 0;
  statClicks.textContent = counts.clicks || 0;
  statSnapshots.textContent = counts.snapshots || 0;

  const toggleShortcut = shortcuts["toggle-recording"];
  const exportShortcut = shortcuts["export-session"];
  shortcutToggle.textContent = toggleShortcut || "Not set";
  shortcutExport.textContent = exportShortcut || "Not set";

  btnPrimary.textContent = recording ? "Stop" : "Start";

  const mode = status?.mode || "auto";
  modeAuto.classList.toggle("active", mode === "auto");
  modeManual.classList.toggle("active", mode === "manual");
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
});

btnExport.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "EXPORT" });
});

btnSync.addEventListener("click", () => {
  if (syncStatus) syncStatus.textContent = "Syncing...";
  chrome.runtime.sendMessage({ type: "SYNC" }, (response) => {
    if (chrome.runtime.lastError) {
      if (syncStatus) syncStatus.textContent = "Sync failed";
      return;
    }
    if (response?.ok) {
      if (syncStatus) syncStatus.textContent = `Synced: ${response.flowId || "-"}`;
    } else {
      if (syncStatus) syncStatus.textContent = response?.error || "Sync failed";
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
