// Global Tauri API (app.withGlobalTauri = true) — no JS bundler needed.
const { invoke } = window.__TAURI__.core;

const $ = (id) => document.getElementById(id);
const statusEl = $("status");

function setStatus(kind, msg) {
  if (!msg) {
    statusEl.hidden = true;
    return;
  }
  statusEl.hidden = false;
  statusEl.className = `status ${kind}`;
  statusEl.textContent = msg;
}

$("open-login").addEventListener("click", async () => {
  setStatus(null);
  try {
    await invoke("open_login");
    $("qr-hint").hidden = false;
  } catch (e) {
    setStatus("error", String(e));
  }
});
