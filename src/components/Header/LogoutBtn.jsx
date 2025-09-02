import React from 'react'
import {useDispatch} from "react-redux"
import authService from "../../appwrite/auth.js"
import {logout } from "../../store/authSlice.js"

function LogoutBtn() {
    const dispatch = useDispatch()

    const lougoutHandler = () => {
        authService.logout().then((res) => {
            console.log(res);
            
            dispatch(logout());
        })
    }
  return (
    <button
    className='inline-bock px-6 py-2 duration-200 hover:bg-gray-900 rounded-full'
    onClick={lougoutHandler}
    >Logout</button>
  )
}

export default LogoutBtn