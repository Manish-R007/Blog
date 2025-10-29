import React, { useState } from 'react'
import Container from "../container/Container"
import Logo from "../Logo"
import { Link, useNavigate } from "react-router-dom"
import LogoutBtn from './LogoutBtn'
import { useSelector } from 'react-redux'
import ChatModal from './ChatModal'

function Header() {
    const authStatus = useSelector((state) => state.auth.status)
    const userData = useSelector((state) => state.auth.userData)
    const navigate = useNavigate()
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navItems = [
        { name: "Home", slug: "/", active: true },
        { name: "Login", slug: "/login", active: !authStatus },
        { name: "Signup", slug: "/signup", active: !authStatus },
        { name: "Profile", slug: "/profile", active: authStatus },
        { name: "Add Post", slug: "/add-post", active: authStatus },
    ]

    return (
        <header className='py-3 shadow bg-slate-950 text-white relative'>
            <Container>
                <nav className='flex items-center justify-between'>
                    {/* Logo */}
                    <div className='flex items-center'>
                        <Link to="/" className='mr-4'>
                            <Logo />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex items-center gap-3'>
                        <ul className='flex items-center gap-3'>
                            {navItems.map((item) => item.active ? (
                                <li key={item.name}>
                                    <button
                                        onClick={() => navigate(item.slug)}
                                        className='inline-block px-4 py-2 text-sm lg:px-6 lg:py-2 lg:text-base duration-200 rounded-full font-medium transition-all hover:scale-105 border border-blue-500/30 hover:border-blue-400 bg-blue-600/10 hover:bg-blue-600/20 backdrop-blur-sm text-blue-200 hover:text-white'
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ) : null)}
                        </ul>
                        
                        {authStatus && (
                            <>
                                <LogoutBtn />
                                <button
                                    onClick={() => setIsChatOpen(true)}
                                    className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 lg:px-6 lg:py-2 rounded-full font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-purple-500/30 border border-purple-400/50 text-sm lg:text-base'
                                >
                                    ✨ Ask AI 
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className='md:hidden p-2 rounded-lg border border-blue-500/30 bg-blue-600/10'
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <div className="w-6 h-6 flex flex-col justify-center items-center">
                            <span className={`block w-5 h-0.5 bg-blue-200 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                            <span className={`block w-5 h-0.5 bg-blue-200 mt-1 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-5 h-0.5 bg-blue-200 mt-1 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
                        </div>
                    </button>
                </nav>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className='md:hidden mt-4 pb-4 border-t border-gray-700 pt-4'>
                        <ul className='flex flex-col gap-2'>
                            {navItems.map((item) => item.active ? (
                                <li key={item.name}>
                                    <button
                                        onClick={() => {
                                            navigate(item.slug);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className='w-full text-left px-4 py-3 rounded-lg font-medium transition-all border border-blue-500/30 bg-blue-600/10 text-blue-200 hover:bg-blue-600/20 hover:text-white'
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ) : null)}
                        </ul>
                        
                        {authStatus && (
                            <div className='flex flex-col gap-2 mt-3'>
                                <div className="px-4">
                                    <LogoutBtn />
                                </div>
                                <button
                                    onClick={() => {
                                        setIsChatOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className='w-full text-left px-4 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                                >
                                    ✨ Ask AI 
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Container>

            {/* Chat Modal */}
            {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} />}
        </header>
    )
}

export default Header