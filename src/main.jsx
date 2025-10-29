import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import { Provider } from 'react-redux'
import store from "./store/store.js"

import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Protected from "./components/AuthLayout.jsx"
import Signup from "./pages/Signup.jsx"
import Profile from "./pages/Profile.jsx"
import AddPost from "./pages/AddPost.jsx"
import Post from "./pages/Post.jsx"


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/login",
        element: (
          <Protected authentication={false}>
            <Login />
          </Protected>
        )
      },
      {
        path: "/signup",
        element: (
          <Protected authentication={false}>
            <Signup />
          </Protected>
        )
      },
      {
        // Combined route - handles both /profile and /profile/:userId
        path: "/profile/:userId?",
        element: (
          <Protected authentication>
            <Profile/>
          </Protected>
        )
      },
      {
        path: "/add-post",
        element: (
          <Protected authentication>
            <AddPost />
          </Protected>
        )
      },
      {
        path: "/edit-post/:postId",
        element: (
          <Protected authentication>
            <AddPost />
          </Protected>
        )
      },
      {
        path: "/post/:slug",
        element: <Post/>
      },
      {
        // Optional: Add a posts page if you want to show all posts
        path: "/posts",
        element: <Home /> // or <AllPosts /> if you have that component
      }
    ]
  },
  {
    // Optional: Add a 404 page
    path: "*",
    element: <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-blue-500 hover:text-blue-700">Go back home</a>
      </div>
    </div>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)