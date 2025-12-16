import { useState } from 'react'

export default function UploadSection({ onFileUpload }) {
    const [status, setStatus] = useState(null)

    const handleChange = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return
        const result = await onFileUpload(files)
        setStatus(result)
        setTimeout(() => setStatus(null), 3000)
    }

    return (
        <div className="flex flex-col h-full justify-center">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-blue-400 hover:scale-[1.02] transition-all duration-200 group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:shadow-md transition-shadow">
                        <svg className="w-8 h-8 text-blue-500/80 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                    </div>
                    <p className="mb-1 text-xs text-slate-600 font-semibold group-hover:text-slate-800">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-slate-400">CSV or Excel</p>
                </div>
                <input type="file" className="hidden" onChange={handleChange} accept=".csv,.xls,.xlsx" multiple />
            </label>

            {status && (
                <div className={`mt-4 p-3 text-xs rounded-xl text-center font-bold shadow-sm animate-fade-in ${status.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {status.message}
                </div>
            )}

            <div className="mt-6 flex justify-center">
                <a
                    href="billing_template.csv"
                    download="billing_template.csv"
                    className="text-xs text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1.5 font-medium group/link"
                >
                    <svg className="w-3.5 h-3.5 group-hover/link:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Download CSV Template
                </a>
            </div>
        </div>
    )
}
