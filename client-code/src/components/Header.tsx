const Header = () => {
    return (
        <header className="relative flex items-center justify-between px-8 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 z-10">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90"></div>
            
            {/* Bottom border with gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

            <div className="flex items-center relative">
                {/* Animated logo indicator */}
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full opacity-90 shadow-lg animate-pulse"></div>
                <span className="font-bold text-white text-2xl tracking-tight bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                    Kora 2.0
                </span>
            </div>

            <div className="flex items-center space-x-2">
                <a className="text-white/80 text-sm px-4 py-2 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm">
                    HOME
                </a>
                <a className="text-white bg-white/15 text-sm px-4 py-2 font-medium hover:bg-white/20 rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-lg">
                    CHAT
                </a>
                <a className="text-white/80 text-sm px-4 py-2 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm">
                    CONTACTS
                </a>
                <a className="text-white/80 text-sm px-4 py-2 font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm">
                    SETTINGS
                </a>
            </div>
        </header>
    )
}

export default Header