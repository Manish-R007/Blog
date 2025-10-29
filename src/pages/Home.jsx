import React, { useState, useEffect } from 'react'
import appwriteService from "../appwrite/config"
import Container from '../components/container/Container'
import PostCard from "../components/PostCard"
import authService from '../appwrite/auth'
import { useSelector, useDispatch } from 'react-redux'
import { login, logout } from '../store/authSlice'

function Home() {
  const [posts, setPosts] = useState([])
  const [loadingUser, setLoadingUser] = useState(true) 
  const [postsLoading, setPostsLoading] = useState(true)

  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const dispatch = useDispatch()

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        console.log("🔍 Home - Checking authentication status...")
        console.log("🔍 Home - Redux authStatus:", authStatus)
        console.log("🔍 Home - Redux userData:", userData)

        // Always check with Appwrite to ensure session is valid
        const currentUser = await authService.getCurrentUser()
        
        if (!isMounted) return;

        if (currentUser) {
          console.log("✅ Home - User session found in Appwrite:", currentUser)
          
          // If Redux state doesn't match Appwrite session, update it
          if (!authStatus || userData?.$id !== currentUser.$id) {
            console.log("🔄 Home - Updating Redux state with current user")
            dispatch(login({ userData: currentUser }))
          }
        } else {
          console.log("❌ Home - No valid user session in Appwrite")
          // If Redux says we're logged in but Appwrite says we're not, logout
          if (authStatus) {
            console.log("🔄 Home - Syncing logout state")
            dispatch(logout())
          }
        }
      } catch (error) {
        console.error("💥 Home - Error checking auth status:", error)
        // On error, assume not logged in
        if (authStatus) {
          dispatch(logout())
        }
      } finally {
        if (isMounted) {
          setLoadingUser(false)
        }
      }
    }

    checkAuthStatus()
  }, [authStatus, userData, dispatch])

  useEffect(() => {
    let isMounted = true;

    setPostsLoading(true)
    
    // Only fetch posts if user is logged in
    if (!authStatus) {
      if (isMounted) {
        setPosts([])
        setPostsLoading(false)
      }
      return
    }

    appwriteService.getPosts([])
      .then((posts) => {
        if (!isMounted) return;
        
        if (posts) {
          let filteredPosts = posts.documents;
          
          // Only filter out current user's posts if user is logged in
          if (userData?.$id) {
            filteredPosts = posts.documents.filter(
              post => post.userId !== userData.$id
            )
          }
          
          // Sort posts by createdAt in descending order (newest first)
          const sortedPosts = filteredPosts.sort((a, b) => {
            return new Date(b.$createdAt) - new Date(a.$createdAt)
          })
          
          setPosts(sortedPosts)
        } else {
          setPosts([])
        }
      })
      .catch(error => {
        console.error("Error fetching posts:", error);
        if (isMounted) {
          setPosts([])
        }
      })
      .finally(() => {
        if (isMounted) {
          setPostsLoading(false)
        }
      })

    return () => {
      isMounted = false;
    };
  }, [userData?.$id, authStatus])

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        <h1 className="text-2xl font-semibold mt-6 tracking-wide animate-pulse">
          Loading, please wait...
        </h1>
        <p className="text-gray-400 mt-2 text-sm italic">
          Preparing something awesome for you ✨
        </p>
      </div>
    )
  }

  // Show landing page for non-logged in users
  if (!authStatus) {
    return (
      <div className='w-full min-h-screen text-white bg-gradient-to-br from-gray-900 via-blue-900/80 to-gray-900'>
        <Container>
          <div className="max-w-6xl mx-auto px-6 py-20">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className='text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent'>
                Welcome to <span className="text-blue-400">BlogSphere</span>
              </h1>
              <p className='text-2xl text-gray-200 mb-8 leading-relaxed'>
                Where <span className="text-cyan-300 font-semibold">ideas spark</span>,{' '}
                <span className="text-blue-300 font-semibold">stories unfold</span>, and{' '}
                <span className="text-emerald-300 font-semibold">communities grow</span>
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-blue-500/20 hover:bg-blue-500/10 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Share Your Voice</h3>
                <p className="text-gray-300">
                  Express your thoughts, share your experiences, and inspire others with your unique perspective. Your story matters.
                </p>
              </div>

              <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-cyan-500/20 hover:bg-cyan-500/10 transition-all duration-300">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-cyan-300">Connect Globally</h3>
                <p className="text-gray-300">
                  Join a vibrant community of writers and readers from around the world. Discover diverse cultures and perspectives.
                </p>
              </div>

              <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-emerald-500/20 hover:bg-emerald-500/10 transition-all duration-300">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-emerald-300">Grow Together</h3>
                <p className="text-gray-300">
                  Learn from fellow creators, get feedback on your writing, and watch your skills blossom in our supportive environment.
                </p>
              </div>
            </div>

            {/* Inspiration Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Whether you're a seasoned writer or just starting out, BlogSphere provides the perfect platform to share your voice with the world. Join thousands of creators who are already shaping the future of digital storytelling.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <a
                  href="/login"
                  className='px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                >
                  ✨ Start Reading & Writing
                </a>
                <a
                  href="/signup"
                  className='px-8 py-4 border-2 border-blue-400/50 hover:bg-blue-500/10 rounded-xl font-bold text-lg transition-all transform hover:scale-105'
                >
                  🚀 Create Free Account
                </a>
              </div>
            </div>

            {/* Testimonial/Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-12">
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-400 mb-2">10K+</div>
                <div className="text-gray-400">Active Writers</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-cyan-400 mb-2">50K+</div>
                <div className="text-gray-400">Published Stories</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-emerald-400 mb-2">1M+</div>
                <div className="text-gray-400">Readers Monthly</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-purple-400 mb-2">150+</div>
                <div className="text-gray-400">Countries</div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center mt-8 p-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
              <h3 className="text-2xl font-bold mb-4 text-blue-300">
                Your Story Awaits Its Audience
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                Don't let your ideas remain unwritten. Join BlogSphere today and become part of a community that celebrates creativity and connection.
              </p>
              <a
                href="/signup"
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
              >
                🎉 Begin Your Writing Adventure
              </a>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  // Show community posts for logged in users
  return (
    <div className='w-full py-8 bg-gradient-to-b from-gray-900 to-black'>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h2 className='text-2xl font-semibold text-white'>
            Latest Blogs from the Community
          </h2>
          <div className="text-blue-300 text-sm">
            Welcome back, {userData?.name || userData?.email?.split('@')[0] || 'User'}!
          </div>
        </div>
        
        {postsLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-white">
            <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading community posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Community Posts Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Be the first to create a post and inspire the community!
            </p>
            <a
              href="/add-post"
              className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all'
            >
              Create Your First Post
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <div 
                key={post.$id}
                className="bg-gray-800/50 rounded-xl border transition-x-0.1 duration-300 hover:bg-gray-800/70"
              >
                <PostCard 
                  $id={post.$id}
                  title={post.title}
                  slug={post.slug} // ← ADD THIS LINE - pass the slug
                  featuredImage={post.featuredImage}
                  createdAt={post.$createdAt}
                  userId={post.userId}
                  userName={post.userName}
                  userEmail={post.userEmail}
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}

export default Home