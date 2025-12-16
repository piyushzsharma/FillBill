export default function Header() {
    return (
        <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2">

                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h1 className="text-sm font-semibold tracking-wide">Smart Billing</h1>
            </div>
            <div className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                v1.0
            </div>
        </div>

    )
}
