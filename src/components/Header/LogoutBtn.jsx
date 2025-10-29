import React from 'react'
import {useDispatch} from "react-redux"
import authService from "../../appwrite/auth.js"
import {logout } from "../../store/authSlice.js"
import { useNavigate } from 'react-router-dom'

function LogoutBtn() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const lougoutHandler = () => {
        authService.logout().then((res) => {
            console.log(res);
            
            dispatch(logout());
            navigate('/login')
        })
    }
  return (
    <button
    className='inline-block px-6 py-2 duration-200 rounded-full font-medium transition-all hover:scale-105 border border-red-500/30 hover:border-red-400 bg-red-600/10 hover:bg-red-600/20 backdrop-blur-sm text-red-200 hover:text-white'
    onClick={lougoutHandler}
    >Logout</button>
  )
}

export default LogoutBtn