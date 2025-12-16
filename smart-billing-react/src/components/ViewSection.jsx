export default function ViewSection({ files, onViewFile, onDeleteFile }) {
    const fileList = Object.values(files);

    if (fileList.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-slate-400 text-xs">No files uploaded yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {fileList.map((file) => (
                <div key={file.name} className="group flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-default">

                    <div className="flex items-center gap-3 overflow-hidden">

                        <div className="w-9 h-9 rounded-lg bg-blue-500/5 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>

                        {/* number of rows */}
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors" title={file.name}>{file.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">{file.data.length} rows</p>
                        </div>
                    </div>

                    {/* View and delete buttons for file */}
                    <div className="flex items-center gap-1.5 opacity-100">
                        <button
                            onClick={() => onViewFile(file.name)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Open"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        <button
                            onClick={() => onDeleteFile(file.name)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
