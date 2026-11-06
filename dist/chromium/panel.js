const api = globalThis.browser || globalThis.chrome;
const files = document.getElementById("files");
const status = document.getElementById("status");
let saved = [];

async function getSaved() {
  const result = await api.storage.local.get("handles");
  return Array.isArray(result.handles) ? result.handles : [];
}

function render() {
  document.getElementById("total").textContent = saved.length.toLocaleString();
  const list = document.getElementById("handles");
  list.replaceChildren();
  if (!saved.length) { const empty = document.createElement("span"); empty.className = "empty"; empty.textContent = "No handles yet"; list.append(empty); }
  else for (const handle of saved.slice().sort()) { const chip = document.createElement("span"); chip.className = "handle"; chip.textContent = "@" + handle; list.append(chip); }
  document.getElementById("download").disabled = !saved.length;
  document.getElementById("clear").disabled = !saved.length;
}

files.addEventListener("change", async () => {
  if (!files.files.length) return;
  try {
    const existing = new Set(await getSaved());
    let found = 0, added = 0;
    for (const file of files.files) {
      const parsed = BuddyHandles.extractHandles(await file.text());
      found += parsed.handles.length;
      for (const handle of parsed.handles) if (!existing.has(handle)) { existing.add(handle); added++; }
    }
    if (!found) throw new Error("No valid handles were found in the selected CSV files.");
    saved = [...existing].sort();
    await api.storage.local.set({ handles: saved });
    status.className = "";
    status.textContent = `Added ${added} new handle${added === 1 ? "" : "s"}. Found ${found} across ${files.files.length} file${files.files.length === 1 ? "" : "s"}; total ${saved.length}.`;
    render();
  } catch (error) { status.className = "error"; status.textContent = error.message || "Could not read the CSV."; }
  files.value = "";
});

document.getElementById("download").addEventListener("click", () => {
  const blob = new Blob([BuddyHandles.toCsv(saved)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "buddy-box-handles.csv";
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
});

document.getElementById("clear").addEventListener("click", async () => {
  if (!confirm(`Remove all ${saved.length} saved handles?`)) return;
  saved = [];
  await api.storage.local.set({ handles: [] });
  status.textContent = "List cleared.";
  render();
});

api.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.handles) { saved = changes.handles.newValue || []; render(); }
});
getSaved().then(handles => { saved = handles; render(); });
