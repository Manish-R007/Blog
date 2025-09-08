import React, { useState } from 'react'
import Container from "../container/Container"
import Logo from "../Logo"
import { Link, useNavigate } from "react-router-dom"
import LogoutBtn from './LogoutBtn'
import { useSelector } from 'react-redux'
import ChatModal from './ChatModal' // Import the new ChatModal component

function Header() {
    const authStatus = useSelector((state) => state.auth.status)
    const navigate = useNavigate()
    const [isChatOpen, setIsChatOpen] = useState(false)

    const navItems = [
        { name: "Home", slug: "/", active: true },
        { name: "Login", slug: "/login", active: !authStatus },
        { name: "Signup", slug: "/signup", active: !authStatus },
        { name: "All Posts", slug: "/all-posts", active: authStatus },
        { name: "Add Post", slug: "/add-post", active: authStatus }
    ]

    return (
        <header className='py-3 shadow bg-slate-950 text-slate-100 relative'>
            <Container>
                <nav className='flex items-center'>
                    <div className='mr-4'>
                        <Link to="/">
                            <Logo />
                        </Link>
                    </div>

                    <ul className='flex ml-auto items-center gap-2'>
                        {
                            navItems.map((item) => item.active ? (
                                <li key={item.name}>
                                    <button
                                        onClick={() => navigate(item.slug)}
                                        className='inline-block px-6 py-2 duration-200 hover:bg-gray-900 rounded-full'
                                    >
                                        {item.name}
                                    </button>
                                </li>
                            ) : null)
                        }
                        {authStatus && (
                            <li>
                                <LogoutBtn />
                            </li>
                        )}

                        {/* 🆕 Chat Button */}
                        <li>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition'
                            >
                                Ask AI 
                            </button>
                        </li>
                    </ul>
                </nav>
            </Container>

            {/* 🆕 Chat Modal */}
            {isChatOpen && <ChatModal onClose={() => setIsChatOpen(false)} />}
        </header>
    )
}

export default Header;
