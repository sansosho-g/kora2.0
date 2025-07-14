import { useState } from "react"

interface InputBarProps {
  currentMessage: string;
  setCurrentMessage: (msg: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const InputBar = ({ currentMessage, setCurrentMessage, onSubmit }: InputBarProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(e.target.value)
    }

    return (
        <form onSubmit={onSubmit} className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-600 backdrop-blur-sm">
                <button
                    type="button"
                    className="p-3 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </button>
                <input
                    type="text"
                    placeholder="Type your message here..."
                    value={currentMessage}
                    onChange={handleChange}
                    className="flex-grow px-4 py-3 bg-transparent focus:outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-lg"
                />
                <button
                    type="button"
                    className="p-3 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-all duration-300"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                    </svg>
                </button>
                <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 rounded-xl p-3 ml-3 shadow-lg transition-all duration-300 group transform hover:scale-105"
                >
                    <svg className="w-6 h-6 text-white transform rotate-45 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                </button>
            </div>
        </form>
    )
}

export default InputBar