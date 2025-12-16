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
        if (file.name.endsWith('.csv')) {
          data = await parseCSV(file);
        } else {
          data = await parseXLS(file);
        }
        newProcessedFiles[file.name] = {
          name: file.name,
          data: data,
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
        complete: (results) => resolve(results.data)
      });
    });
  }

  const parseXLS = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        resolve(data);
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
    chrome.tabs.sendMessage(tab.id, { action: 'autofill', data: selectedRow });
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
