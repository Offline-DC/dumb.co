// Fullscreen QR window: fetch the SVG the main window just rendered and show it
// as big as possible for the phone to scan.
const { invoke } = window.__TAURI__.core;

(async () => {
  const el = document.getElementById("qr");
  try {
    const svg = await invoke("get_qr_svg");
    if (svg) {
      el.innerHTML = svg;
    } else {
      el.textContent = "No code yet — go back and sign in to Google first.";
    }
  } catch (e) {
    el.textContent = String(e);
  }
})();
