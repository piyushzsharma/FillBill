# Smart Billing Autofill Extension

A React-based browser extension to upload CSV/XLS billing files and autofill form fields on web pages.

## Features
- **Upload Support**: Supports `.csv` and `.xlsx` files.
- **Data Persistence**: Saves uploaded files in browser storage.
- **Autofill**: Automatically matches CSV headers to input name/id attributes and fills values.
- **Cross-Browser**: Compatible with Chrome, Edge, Brave, and Firefox (v121+).

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Extension**
   ```bash
   npm run build
   ```
   This creates a `dist` folder containing the extension files.

## How to Install

### Microsoft Edge & Google Chrome (and Brave/Opera)
1. Open the browser and navigate to the extensions page:
   - **Edge**: `edge://extensions`
   - **Chrome**: `chrome://extensions`
2. Enable **Developer Mode** (usually a toggle in the corner).
3. Click **"Load unpacked"**.
4. Select the `dist` folder from this project.

### Mozilla Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on..."**.
3. Navigate to the `dist` folder and select the `manifest.json` file.
   - *Note*: You must have Firefox version 121 or later for Manifest V3 Service Worker support.

## Compatibility Note
This extension uses Manifest V3 and the `chrome.*` API. 
- **Edge** and **Chrome** fully support this natively.
- **Firefox** supports the `chrome.*` namespace for compatibility, so the code runs without modification. 

## Project Structure
- `src/`: React source code (Popup) and Extension scripts (`content.js`, `background.js`)
- `public/`: Static assets (`manifest.json`, icons)
- `dist/`: Production build output (load this folder in the browser)
