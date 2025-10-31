import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Container from "../components/container/Container"
import PostForm from "../components/post-form/PostForm"
import appwriteService from "../appwrite/config"

function AddPost() {
    const [loading, setLoading] = useState(true)
    const [post, setPost] = useState(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { postId } = useParams()
    const authStatus = useSelector((state) => state.auth.status)
    const userData = useSelector((state) => state.auth.userData)

    useEffect(() => {
        // If not authenticated, redirect immediately
        if (authStatus === false) {
            console.log("User not authenticated, redirecting to login")
            navigate('/login')
            return
        }

        // If auth status is still loading, wait
        if (authStatus === null) {
            console.log("Waiting for authentication...")
            return
        }

        // Only proceed if we're authenticated
        if (authStatus === true && userData) {
            console.log("AddPost - User authenticated, initializing page...")
            console.log("AddPost - postId from URL:", postId)

            const initializePage = async () => {
                try {
                    if (postId) {
                        console.log("Edit mode detected, fetching post data...")
                        setIsEditMode(true)
                        
                        try {
                            const postData = await appwriteService.getPostById(postId)
                            console.log("Post data fetched for editing:", postData)
                            
                            if (!postData) {
                                setError("Post not found")
                                setLoading(false)
                                return
                            }
                            
                            if (postData.userId !== userData.$id) {
                                console.log("User is not the author, redirecting...")
                                setError("You are not authorized to edit this post")
                                setLoading(false)
                                return
                            }
                            
                            setPost(postData)
                        } catch (error) {
                            console.error("Error fetching post:", error)
                            setError("Failed to load post for editing")
                        }
                    } else {
                        console.log("Create new post mode")
                        setIsEditMode(false)
                    }
                    
                } catch (error) {
                    console.error('Error initializing page:', error)
                    setError("Failed to initialize page")
                } finally {
                    setLoading(false)
                }
            }

            initializePage()
        }
    }, [authStatus, userData, navigate, postId])

    // Show loading state while checking authentication or loading post data
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-black text-white">
                <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                <h1 className="text-2xl font-semibold mt-6 tracking-wide animate-pulse">
                    {isEditMode ? "Loading Post Editor..." : "Loading Post Creator..."}
                </h1>
                <p className="text-gray-400 mt-2 text-sm italic">
                    {isEditMode ? "Getting your post ready for editing" : "Getting everything ready for your amazing content"}
                </p>
            </div>
        )
    }

    // Show error state if there's an error
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8 flex items-center justify-center">
                <Container>
                    <div className="max-w-md mx-auto text-center">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-red-300 mb-3">Error</h2>
                            <p className="text-red-200/80 mb-6">{error}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    // Render the main content
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
            <Container>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl ${
                            isEditMode 
                                ? 'bg-gradient-to-r from-yellow-600 to-orange-600' 
                                : 'bg-gradient-to-r from-blue-600 to-purple-600'
                        }`}>
                            <span className="text-2xl">
                                {isEditMode ? '✏️' : '📝'}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">
                            {isEditMode ? 'Edit Post' : 'Create New Post'}
                        </h1>
                        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                            {isEditMode 
                                ? 'Update and improve your existing post' 
                                : 'Craft your story and share it with the world'
                            }
                        </p>
                        {isEditMode && post && (
                            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg max-w-md mx-auto">
                                <p className="text-yellow-300 text-sm">
                                    Editing: <strong>"{post.title}"</strong>
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="w-full bg-gray-800/80 rounded-2xl p-8 border border-gray-700/50 shadow-2xl backdrop-blur-sm">
                        <PostForm post={post} />
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default AddPost