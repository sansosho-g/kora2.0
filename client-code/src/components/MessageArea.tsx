import React from 'react';

const PremiumTypingAnimation = () => {
    return (
        <div className="flex items-center">
            <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-indigo-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-purple-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "300ms" }}></div>
                <div className="w-2 h-2 bg-pink-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "600ms" }}></div>
            </div>
        </div>
    );
};

interface SearchInfo {
  stages: string[];
  query: string;
  urls: string[];
  error?: string;
}

const SearchStages = ({ searchInfo }: { searchInfo?: SearchInfo }) => {
    if (!searchInfo || !searchInfo.stages || searchInfo.stages.length === 0) return null;

    return (
        <div className="mb-4 mt-2 relative pl-4">
            {/* Search Process UI */}
            <div className="flex flex-col space-y-4 text-sm text-slate-700 dark:text-slate-300">
                {/* Searching Stage */}
                {searchInfo.stages.includes('searching') && (
                    <div className="relative">
                        {/* Animated dot */}
                        <div className="absolute -left-3 top-1 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full z-10 shadow-lg animate-pulse"></div>

                        {/* Connecting line to next item if reading exists */}
                        {searchInfo.stages.includes('reading') && (
                            <div className="absolute -left-[6px] top-4 w-0.5 h-[calc(100%+1rem)] bg-gradient-to-b from-indigo-300 to-purple-300"></div>
                        )}

                        <div className="flex flex-col">
                            <span className="font-semibold mb-2 ml-2 text-indigo-600 dark:text-indigo-400">🔍 Searching the web</span>

                            {/* Search Query in box styling */}
                            <div className="flex flex-wrap gap-2 pl-2 mt-1">
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-xs px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-700 inline-flex items-center shadow-sm">
                                    <svg className="w-3 h-3 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                    {searchInfo.query}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reading Stage */}
                {searchInfo.stages.includes('reading') && (
                    <div className="relative">
                        {/* Animated dot */}
                        <div className="absolute -left-3 top-1 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full z-10 shadow-lg animate-pulse"></div>

                        <div className="flex flex-col">
                            <span className="font-semibold mb-2 ml-2 text-purple-600 dark:text-purple-400">📖 Reading sources</span>

                            {/* Search Results */}
                            {searchInfo.urls && searchInfo.urls.length > 0 && (
                                <div className="pl-2 space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(searchInfo.urls) && searchInfo.urls.map((url: string, index: number) => (
                                            <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-xs px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 truncate max-w-[200px] transition-all duration-300 hover:scale-105 hover:shadow-md">
                                                {url}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Writing Stage */}
                {searchInfo.stages.includes('writing') && (
                    <div className="relative">
                        {/* Animated dot with glow effect */}
                        <div className="absolute -left-3 top-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full z-10 shadow-lg animate-pulse"></div>
                        <span className="font-semibold pl-2 text-pink-600 dark:text-pink-400">✍️ Writing answer</span>
                    </div>
                )}

                {/* Error Message */}
                {searchInfo.stages.includes('error') && (
                    <div className="relative">
                        {/* Red dot over the vertical line */}
                        <div className="absolute -left-3 top-1 w-3 h-3 bg-gradient-to-r from-red-400 to-rose-400 rounded-full z-10 shadow-lg"></div>
                        <span className="font-semibold text-red-600 dark:text-red-400">❌ Search error</span>
                        <div className="pl-4 text-xs text-red-500 dark:text-red-400 mt-1">
                            {searchInfo.error || "An error occurred during search."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MessageArea = ({ messages }: { messages: Message[] }) => {
    return (
        <div className="flex-grow overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-600" style={{ minHeight: 0 }}>
            <div className="max-w-4xl mx-auto p-6">
                {messages.map((message: Message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-6 animate-slide-in`}>
                        <div className="flex flex-col max-w-lg">
                            {/* Search Status Display - Now ABOVE the message */}
                            {!message.isUser && message.searchInfo && (
                                <SearchStages searchInfo={message.searchInfo} />
                            )}

                            {/* Message Content */}
                            <div
                                className={`rounded-2xl py-4 px-6 shadow-lg ${message.isUser
                                    ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-br-md'
                                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-md'
                                    }`}
                            >
                                {message.isLoading ? (
                                    <PremiumTypingAnimation />
                                ) : (
                                    message.content || (
                                        // Fallback if content is empty but not in loading state
                                        <span className="text-slate-400 dark:text-slate-500 text-sm italic">Waiting for response...</span>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  type: string;
  isLoading?: boolean;
  searchInfo?: SearchInfo;
}

export default MessageArea;