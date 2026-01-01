import { useState } from "react";

export default function RowSection({
    fileName,
    data,
    headers: propHeaders,
    selectedRow,
    setSelectedRow,
    onBack,
    onAutofill,
}) {
    const [search, setSearch] = useState("");

    if (!data || data.length === 0)
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                    <button
                        onClick={onBack}
                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            ></path>
                        </svg>
                    </button>
                    <span className="font-semibold text-xs text-slate-700 truncate">
                        {fileName}
                    </span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-xs">Empty file or no data found</div>
                </div>
            </div>
        );

    const filteredData = data.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
    );

    // Use explicit headers from props if available, otherwise derive from data
    const headers = propHeaders && propHeaders.length > 0
        ? propHeaders.filter(key => key && !key.startsWith('__'))
        : Object.keys(data[0] || {}).filter(key => key && !key.startsWith('__'));

    return (
        <div className="flex flex-col h-full">
            {/* Top Bar */}
            <div className="flex items-center gap-2 mb-3 shrink-0">
                <button
                    onClick={onBack}
                    className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        ></path>
                    </svg>
                </button>
                <span className="font-semibold text-xs text-slate-700 truncate flex-1">
                    {fileName}
                </span>
            </div>

            {/* Search */}
            <div className="mb-3 shrink-0 relative">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all placeholder-slate-400 text-slate-600"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <svg
                    className="w-4 h-4 text-slate-400 absolute left-2.5 top-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                </svg>
            </div>

            {/* Table Area (Scrollable) */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-xl mb-3 bg-white shadow-sm">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={`${h}-${i}`} className="px-3 py-2.5 whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => setSelectedRow(row)}
                                className={`cursor-pointer transition-colors ${selectedRow === row
                                    ? "bg-blue-50 text-blue-700"
                                    : row.__filled
                                        ? "bg-slate-50/50 text-slate-400 grayscale hover:bg-slate-100/50"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {headers.map((h, colIndex) => (
                                    <td
                                        key={`${h}-${colIndex}`}
                                        className="px-3 py-2 whitespace-nowrap max-w-[150px] truncate"
                                    >
                                        {row[h]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer / Autofill Button */}
            <div className="shrink-0 pt-2 border-t border-slate-100">
                <button
                    onClick={onAutofill}
                    disabled={!selectedRow}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${selectedRow
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transform active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                >
                    {selectedRow ? "Autofill Row" : "Select a row"}
                </button>
            </div>
        </div>
    );
}
