# Buddy Box

Buddy Box highlights posts and comments by people whose handles you save. It watches the visible page on X, Instagram, Facebook, and TikTok and draws a green outline around matching content as feeds load. Handles are matched to the **author**, not to mentions in the post text.

## Features

- Import one or several CSV files at a time. Buddy Box detects columns named `handle`, `username`, `screen name`, `account`, or `profile URL` (and accepts a single-column CSV without a header).
- Add more files later. Handles are normalized without `@`, compared without regard to case, and deduplicated.
- See the total number of unique saved handles.
- Download the complete list as a reusable CSV, or clear it.
- Keep the list in the browser's local extension storage. No account or server is required.

Example CSV:

```csv
name,handle
Alice,@alice
Bob,https://www.tiktok.com/@bob
```

## Build and load

Run `npm run build` (Node.js required). There are no package dependencies.

| Browser | Load for development | Controls |
| --- | --- | --- |
| Chrome | `chrome://extensions` → Developer mode → Load unpacked → `dist/chromium` | Click the Buddy Box toolbar button to open its side panel. |
| Brave | `brave://extensions` → Developer mode → Load unpacked → `dist/chromium` | Click the Buddy Box toolbar button to open its side panel. |
| Firefox | `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → `dist/firefox/manifest.json` | Click the Buddy Box toolbar button to open its sidebar. |
| Safari | Package `dist/safari` with Apple's `xcrun safari-web-extension-packager /absolute/path/to/dist/safari`, then build and enable the generated app in Xcode and Safari. | Click the toolbar button to open the management popup. Safari Web Extensions do not provide the same extension sidebar API as Chrome or Firefox. |

The Chrome and Firefox controls open in a sidebar when the toolbar button is clicked. Browser security rules do not allow an extension to force a sidebar open immediately on installation or every browser startup. Safari highlighting works through its content script, while handle management uses a popup. The Safari package needs Xcode and an Apple developer setup for distribution.

For development, reload the extension after rebuilding. Site layouts change over time, so author detection may need selector updates. This release checks content currently rendered in the page; it does not scan posts hidden behind login screens or fetch data through social network APIs.

## Test

Run `npm test` for CSV parsing, normalization, deduplication, and export checks.

## Prompt used to create this program

> Build Buddy Box as a browser extension for Chrome, Brave, Firefox, and Safari. Open its controls in a browser sidebar by default where the browser supports one. Let users upload one or more CSV files containing social media handles. Automatically identify the handle column, normalize and deduplicate handles across imports, and show the total number of unique handles. Let users add more files later and download the saved handles as a CSV. Continuously inspect visible timelines and comments on X, Instagram, Facebook, and TikTok. When the author of a post or comment matches a saved handle, draw a green box around that item. Document installation, browser differences, and usage in a README.

## Browser API references

- [Chrome Side Panel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
- [Firefox sidebarAction API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/sidebarAction)
- [Apple's Safari Web Extension packaging guide](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari)
