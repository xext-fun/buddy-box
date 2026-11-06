import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
for (const browser of ["chromium", "firefox", "safari"]) {
  const dest = join(root, "dist", browser);
  await mkdir(dest, { recursive: true });
  for (const file of ["handles.js", "panel.html", "panel.css", "panel.js", "content.js", "content.css", "background.js"]) {
    if (browser === "safari" && file === "background.js") continue;
    await cp(join(root, "src", file), join(dest, file));
  }
  await writeFile(join(dest, "manifest.json"), await readFile(join(root, "manifests", `${browser}.json`)));
}
console.log("Built dist/chromium, dist/firefox, and dist/safari");
