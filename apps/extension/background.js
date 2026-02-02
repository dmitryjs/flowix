importScripts("config.js");

let isRecording = false;
let session = null;
let mode = "auto";

const STORAGE_KEY = "flowix_session";
const STORAGE_MODE_KEY = "flowix_mode";
const WEB_BASE_URL = (self.FLOWIX_CONFIG && self.FLOWIX_CONFIG.WEB_BASE_URL) || "http://localhost:3000";
const EDITOR_URL = `${WEB_BASE_URL}/flows/new?source=extension`;

function createSession() {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    startedAt: now,
    recording: true,
    mode,
    counts: {
      clicks: 0,
      snapshots: 0,
    },
    steps: [],
  };
}

async function saveSessionToStorage() {
  if (!session) return;
  await chrome.storage.local.set({ [STORAGE_KEY]: session });
}

async function saveModeToStorage() {
  await chrome.storage.local.set({ [STORAGE_MODE_KEY]: mode });
}

async function clearSessionStorage() {
  await chrome.storage.local.remove(STORAGE_KEY);
}

async function restoreSessionFromStorage() {
  const result = await chrome.storage.local.get([STORAGE_KEY, STORAGE_MODE_KEY]);
  const stored = result?.[STORAGE_KEY];
  const storedMode = result?.[STORAGE_MODE_KEY];
  if (storedMode === "auto" || storedMode === "manual") {
    mode = storedMode;
  } else {
    mode = "auto";
    await saveModeToStorage();
  }
  if (stored && Array.isArray(stored.steps)) {
    session = stored;
    if (typeof session.recording !== "boolean") {
      session.recording = true;
    }
    if (!session.counts) {
      session.counts = { clicks: 0, snapshots: 0 };
    }
    if (!session.mode) {
      session.mode = mode;
    } else {
      mode = session.mode;
    }
    isRecording = session.recording;
  }
}

function ensureSession() {
  if (!session) {
    session = createSession();
  }
}

function addStep(step) {
  if (!isRecording) return;
  if (mode === "manual" && step.type === "click") return;
  ensureSession();
  session.steps.push(step);
  if (!session.counts) {
    session.counts = { clicks: 0, snapshots: 0 };
  }
  if (step.type === "click") {
    session.counts.clicks += 1;
  }
  if (step.type === "state_snapshot") {
    session.counts.snapshots += 1;
  }
  void saveSessionToStorage();
}

async function captureSnapshot(tabId) {
  if (!isRecording) return;

  const captureTabId = tabId ?? (await getActiveTabId());
  if (!captureTabId) return;

  const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
    format: "png",
  });

  const tab = await chrome.tabs.get(captureTabId);
  const url = tab.url ?? "";

  addStep({
    id: crypto.randomUUID(),
    ts: Date.now(),
    type: "state_snapshot",
    url,
    screenshot: dataUrl,
  });
}

async function getActiveTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id ?? null;
}

async function exportSession() {
  if (!session) return;
  session.recording = isRecording;
  session.mode = mode;
  const json = JSON.stringify(session, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = `flowix-session-${Date.now()}.json`;

  await chrome.downloads.download({
    url,
    filename,
    saveAs: true,
  });

  URL.revokeObjectURL(url);
  session = null;
  isRecording = false;
  void clearSessionStorage();
}

async function toggleRecording() {
  isRecording = !isRecording;
  if (isRecording) {
    session = createSession();
    await saveSessionToStorage();
  } else {
    if (session) {
      session.recording = false;
    }
    session = null;
    await clearSessionStorage();
  }
}

async function getShortcuts() {
  try {
    const commands = await chrome.commands.getAll();
    const map = {};
    for (const command of commands) {
      map[command.name] = command.shortcut || null;
    }
    return map;
  } catch {
    return null;
  }
}

async function getStatus() {
  const counts = session?.counts ?? { clicks: 0, snapshots: 0 };
  const startedAt = session?.startedAt ?? null;
  const recording = session?.recording ?? false;
  const shortcuts = await getShortcuts();
  let currentUrl = null;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentUrl = tabs[0]?.url ?? null;
  } catch {
    currentUrl = null;
  }
  return {
    recording,
    startedAt,
    counts,
    mode,
    shortcuts,
    currentUrl,
  };
}

async function getSessionForSync() {
  if (session) return session;
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result?.[STORAGE_KEY] ?? null;
}

async function syncFlow() {
  const currentStatus = await getStatus();
  const flow = await getSessionForSync();
  if (!flow) {
    return { ok: false, error: "No session" };
  }

  const payload = {
    flow,
    meta: {
      startedAt: flow.startedAt ?? null,
      mode: flow.mode ?? mode,
      recording: flow.recording ?? false,
      counts: flow.counts ?? { clicks: 0, snapshots: 0 },
      currentUrl: currentStatus.currentUrl ?? null,
    },
  };

  const response = await fetch(`${WEB_BASE_URL}/api/sync/flow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorText = "Sync failed";
    try {
      const data = await response.json();
      errorText = data?.error || errorText;
    } catch {
      // ignore
    }
    return { ok: false, error: errorText, status: response.status };
  }

  const data = await response.json();
  return { ok: true, flowId: data?.flowId };
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "record_click") {
    addStep(message.payload);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "snapshot") {
    await captureSnapshot();
    return;
  }

  if (command === "toggle-recording") {
    await toggleRecording();
    return;
  }

  if (command === "export-session") {
    await exportSession();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_STATUS") {
    getStatus().then((status) => sendResponse(status));
    return true;
  }
  if (message?.type === "TOGGLE_RECORDING") {
    toggleRecording().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message?.type === "SET_MODE") {
    if (message.mode === "auto" || message.mode === "manual") {
      mode = message.mode;
      if (session) {
        session.mode = mode;
        void saveSessionToStorage();
      }
      void saveModeToStorage();
    }
    sendResponse({ ok: true });
  }
  if (message?.type === "SNAPSHOT") {
    captureSnapshot().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message?.type === "EXPORT") {
    exportSession().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message?.type === "OPEN_EDITOR") {
    chrome.tabs.create({ url: EDITOR_URL });
    sendResponse({ ok: true });
  }
  if (message?.type === "SYNC") {
    syncFlow().then((result) => sendResponse(result));
    return true;
  }
});

restoreSessionFromStorage();
