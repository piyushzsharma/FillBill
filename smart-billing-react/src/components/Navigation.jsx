export default function Navigation({ currentView, setCurrentView }) {
    return (
        <div className="flex rounded-md bg-gray-100 p-1 mb-4 shrink-0">
            <button
                onClick={() => setCurrentView('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-sm transition-all ${currentView === 'upload'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                Upload
            </button>
            <button
                onClick={() => setCurrentView('view')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-sm transition-all ${currentView === 'view'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                My Files
            </button>
        </div>
    )
}
