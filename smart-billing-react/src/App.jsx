/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import Header from './components/Header'
import Navigation from './components/Navigation'
import UploadSection from './components/UploadSection'
import ViewSection from './components/ViewSection'
import RowSection from './components/RowSection'

function App() {
  const [currentView, setCurrentView] = useState('upload')
  const [files, setFiles] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [currentData, setCurrentData] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)

  useEffect(() => {
    chrome.storage.local.get(['files'], (result) => {
      setFiles(result.files || {})
    })
  }, [])

  const handleFileUpload = async (filesInput) => {
    try {
      const filesList = Array.isArray(filesInput) ? filesInput : [filesInput];
      const newProcessedFiles = {};

      for (const file of filesList) {
        let data = [];
        let headers = [];
        if (file.name.endsWith('.csv')) {
          const result = await parseCSV(file);
          data = result.data;
          headers = result.headers;
        } else {
          const result = await parseXLS(file);
          data = result.data;
          headers = result.headers;
        }
        newProcessedFiles[file.name] = {
          name: file.name,
          data: data,
          headers: headers,
          uploadedAt: new Date().toISOString()
        };
      }

      const newFilesState = { ...files, ...newProcessedFiles };
      chrome.storage.local.set({ files: newFilesState });
      setFiles(newFilesState);

      setTimeout(() => setCurrentView('view'), 500);
      return { success: true, message: `Uploaded ${filesList.length} file(s)` };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error" };
    }
  }

  const parseCSV = (file) => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => resolve({ data: results.data, headers: results.meta.fields })
      });
    });
  }

  const parseXLS = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Use cellDates: true to automatically parse Excel serial dates (e.g. 46022) to Date objects
        const rawData = XLSX.utils.sheet_to_json(sheet, { cellDates: true });

        // Post-process to ensure Dates become standard strings (YYYY-MM-DD)
        const data = rawData.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            const val = row[key];
            if (val instanceof Date) {
              // Use local time methods to avoid UTC shifts (which can cause off-by-one day errors)
              const year = val.getFullYear();
              const month = String(val.getMonth() + 1).padStart(2, '0');
              const day = String(val.getDate()).padStart(2, '0');
              // Format as DD-MM-YYYY to match the target website's expected text format.
              // Note: content.js handles conversion to YYYY-MM-DD for input type="date" automatically.
              newRow[key] = `${day}-${month}-${year}`;
            } else {
              newRow[key] = val;
            }
          });
          return newRow;
        });

        // Extract headers ensuring they match the file's visual order
        let headers = [];

        // 1. Primary Method: Get the first row directly as array.
        const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];

        if (headerRow && Array.isArray(headerRow) && headerRow.length > 0) {
          headers = headerRow.map(h => String(h || ""));
        } else if (data.length > 0) {
          headers = Object.keys(data[0]);
        }

        resolve({ data, headers });
      };
      reader.readAsArrayBuffer(file);
    });
  }

  const deleteFile = (fileName) => {
    const newFiles = { ...files };
    delete newFiles[fileName];
    setFiles(newFiles);
    chrome.storage.local.set({ files: newFiles });
  }

  const viewFileRows = (fileName) => {
    setCurrentFile(fileName);
    setCurrentData(files[fileName].data);
    setSelectedRow(null);
    setCurrentView('rows');
  }

  const performAutofill = async () => {
    if (!selectedRow) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Use scripting to broadcast to ALL frames (iframes included)
    // We send a custom DOM event that content.js listens for, 
    // or we can try to send a message from within the frame to itself (redundant).
    // The most robust way for "all frames" without keeping track of frame IDs is:
    // Execute a script in all frames that dispatches an event.

    chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: (data) => {
        // Dispatch event that content.js listens for
        window.dispatchEvent(new CustomEvent('SMART_BILLING_AUTOFILL_TRIGGER', { detail: data }));
      },
      args: [selectedRow]
    });

    // Mark row as filled
    const rowIndex = currentData.indexOf(selectedRow);
    if (rowIndex !== -1) {
      const updatedRow = { ...selectedRow, __filled: true };
      const updatedData = [...currentData];
      updatedData[rowIndex] = updatedRow;

      setCurrentData(updatedData);
      setSelectedRow(updatedRow);

      if (currentFile) {
        const updatedFiles = {
          ...files,
          [currentFile]: {
            ...files[currentFile],
            data: updatedData
          }
        };
        setFiles(updatedFiles);
        chrome.storage.local.set({ files: updatedFiles });
      }
    }
  }

  return (
    <div className="w-[400px] h-[500px] bg-slate-50 text-slate-800 flex flex-col font-sans text-sm">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {currentView !== 'rows' && (
          <Navigation currentView={currentView} setCurrentView={setCurrentView} />
        )}

        {currentView === 'upload' && (
          <UploadSection onFileUpload={handleFileUpload} />
        )}

        {currentView === 'view' && (
          <ViewSection
            files={files}
            onViewFile={viewFileRows}
            onDeleteFile={deleteFile}
          />
        )}

        {currentView === 'rows' && (
          <RowSection
            fileName={currentFile}
            data={currentData}
            headers={files[currentFile]?.headers}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
            onBack={() => setCurrentView('view')}
            onAutofill={performAutofill}
          />
        )}
      </div>
    </div>
  )
}

export default App
