// App.jsx
import React from 'react'
import { Outlet } from 'react-router-dom' // Add Outlet
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Header />
      <main>
        <Outlet /> {/* This renders the child routes */}
      </main>
      <Footer />
    </div>
  )
}

export default App