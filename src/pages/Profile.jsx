import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import appwriteService from "../appwrite/config.js"
import authService from "../appwrite/auth.js"
import Container from '../components/container/Container.jsx'
import { Query } from "appwrite"

function Profile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [profileUser, setProfileUser] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true) // Add separate posts loading state
  const [error, setError] = useState(null)
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState('')

  // Function to get user info - UPDATED VERSION
  const getUserInfo = async (userId) => {
    try {
      const storedProfilePic = localStorage.getItem(`profilePic_${userId}`);
      
      // First, try to get the actual user data from Appwrite
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser && currentUser.$id === userId) {
          console.log("✅ Found user data from Appwrite:", currentUser);
          return {
            name: currentUser.name || "User",
            email: currentUser.email || "user@example.com",
            $id: userId,
            profilePicture: storedProfilePic || null
          };
        }
      } catch (userError) {
        console.log("ℹ️ Could not get user data from Appwrite, trying posts...");
      }
      
      // Fallback: Get user info from posts
      const userPosts = await appwriteService.getPosts([Query.equal("userId", userId)]);
      
      if (userPosts && userPosts.documents.length > 0) {
        const firstPost = userPosts.documents[0];
        return {
          name: firstPost.userName || "User",
          email: firstPost.userEmail || "user@example.com",
          $id: userId,
          profilePicture: storedProfilePic || null
        };
      }
      
      // Final fallback: Return basic user info
      return {
        name: "User",
        email: "user@example.com",
        $id: userId,
        profilePicture: storedProfilePic || null
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      return {
        name: "User",
        email: "user@example.com",
        $id: userId,
        profilePicture: null
      };
    }
  };

  // Simplified function to generate profile picture URL
  const getProfilePictureUrl = (fileId) => {
    if (!fileId) {
      console.log("❌ No file ID provided");
      return null;
    }
    
    try {
      console.log("🔄 Generating URL for file:", fileId);
      const url = appwriteService.getFileView(fileId);
      console.log("✅ Generated profile picture URL:", url);
      return url;
    } catch (error) {
      console.error("❌ Error generating profile picture URL:", error);
      return null;
    }
  };

  // Function to verify if an image URL is valid
  const verifyImageUrl = (url) => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        console.log("✅ Image URL verified and loaded successfully");
        resolve(true);
      };
      img.onerror = () => {
        console.log("❌ Image URL failed to load");
        resolve(false);
      };
      img.src = url;
      
      setTimeout(() => {
        if (!img.complete) {
          console.log("⏰ Image load timeout");
          resolve(false);
        }
      }, 5000);
    });
  };

  // Function to store profile picture reference
  const storeProfilePictureReference = async (userId, fileId) => {
    try {
      console.log("🔄 Storing profile picture reference for user:", userId);
      localStorage.setItem(`profilePic_${userId}`, fileId);
      console.log("✅ Profile picture reference stored in localStorage");
      return true;
    } catch (error) {
      console.error("Error storing profile picture reference:", error);
      return false;
    }
  };

  // Function to load and verify profile picture
  const loadProfilePicture = async (fileId, targetUserId) => {
    if (!fileId) return null;
    
    try {
      console.log("🔄 Loading profile picture:", fileId);
      const previewUrl = getProfilePictureUrl(fileId);
      
      if (previewUrl) {
        const isValid = await verifyImageUrl(previewUrl);
        if (isValid) {
          console.log("✅ Profile picture loaded and verified successfully");
          return previewUrl;
        } else {
          console.log("❌ Profile picture URL is invalid, clearing reference");
          localStorage.removeItem(`profilePic_${targetUserId}`);
          return null;
        }
      } else {
        console.log("❌ Could not generate profile picture URL");
        localStorage.removeItem(`profilePic_${targetUserId}`);
        return null;
      }
    } catch (imageError) {
      console.error("Error loading profile picture:", imageError);
      localStorage.removeItem(`profilePic_${targetUserId}`);
      return null;
    }
  };

  useEffect(() => {
    console.log("🎯 Profile page loaded with userId:", userId);
    
    const initializeProfile = async () => {
      try {
        setLoading(true);
        setPostsLoading(true); // Start posts loading
        setError(null);
        
        const user = await authService.getCurrentUser();
        
        if (!userId && user) {
          navigate(`/profile/${user.$id}`, { replace: true });
          return;
        }
        
        if (!userId && !user) {
          setError("Please log in to view profiles");
          setLoading(false);
          setPostsLoading(false);
          return;
        }
        
        setCurrentUser(user);
        
        const targetUserId = userId || user?.$id;
        
        if (targetUserId) {
          console.log("🔄 Setting up profile for user:", targetUserId);
          const userProfile = await getUserInfo(targetUserId);
          
          if (userProfile) {
            setProfileUser(userProfile);
            
            // Load profile picture if exists
            if (userProfile.profilePicture) {
              const previewUrl = await loadProfilePicture(userProfile.profilePicture, targetUserId);
              if (previewUrl) {
                setProfileImagePreview(previewUrl);
              }
            } else {
              console.log("ℹ️ No profile picture found for user");
            }
          } else {
            setError("Failed to load user profile");
          }
        }
      } catch (error) {
        console.error("Error initializing profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
        // Don't set postsLoading to false here - it will be set after posts are loaded
      }
    };

    initializeProfile();
  }, [userId, navigate]);

  useEffect(() => {
    const targetUserId = userId || currentUser?.$id;
    if (!targetUserId || loading) return;
    
    setPostsLoading(true);
    console.log("🔄 Fetching posts for user:", targetUserId);
    
    appwriteService.getPosts([Query.equal("userId", targetUserId)])
      .then((posts) => {
        if (posts && posts.documents) {
          console.log("✅ User posts found:", posts.documents.length);
          const sortedPosts = posts.documents.sort((a, b) => 
            new Date(b.$createdAt) - new Date(a.$createdAt)
          );
          setPosts(sortedPosts);
        } else {
          console.log("❌ No posts found or invalid response");
          setPosts([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts");
        setPosts([]);
      })
      .finally(() => {
        console.log("🏁 Posts loading complete");
        setPostsLoading(false);
      });
  }, [userId, currentUser, loading]); // Added loading as dependency

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }
      
      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
      console.log("✅ Local preview generated for new image");
    }
  };

  const uploadProfilePicture = async () => {
    if (!profileImage || !currentUser) return;
    
    setUploadingProfilePic(true);
    try {
      console.log("🔄 Uploading profile picture...");
      
      const oldProfilePicId = localStorage.getItem(`profilePic_${currentUser.$id}`);
      
      // Upload new profile picture
      const uploadedFile = await appwriteService.uploadFile(profileImage);
      
      if (uploadedFile && uploadedFile.$id) {
        console.log("✅ Profile picture uploaded successfully:", uploadedFile.$id);
        
        // Store the reference
        await storeProfilePictureReference(currentUser.$id, uploadedFile.$id);
        
        // Generate the new profile picture URL
        const newProfilePictureUrl = getProfilePictureUrl(uploadedFile.$id);
        
        if (newProfilePictureUrl) {
          // Test if the URL loads successfully
          const img = new Image();
          
          const imageLoadPromise = new Promise((resolve, reject) => {
            img.onload = () => resolve(true);
            img.onerror = () => reject(new Error("Image failed to load"));
            img.src = newProfilePictureUrl;
          });
          
          // Wait for image to load or timeout
          try {
            await Promise.race([
              imageLoadPromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Image load timeout")), 10000)
              )
            ]);
            
            console.log("✅ New profile picture verified and set successfully");
            setProfileImagePreview(newProfilePictureUrl);
            
            // Delete old profile picture if exists
            if (oldProfilePicId) {
              try {
                await appwriteService.deleteFile(oldProfilePicId);
                console.log("🗑️ Deleted old profile picture");
              } catch (deleteError) {
                console.log("ℹ️ Could not delete old profile picture:", deleteError);
              }
            }
            
            setProfileUser(prev => ({
              ...prev,
              profilePicture: uploadedFile.$id
            }));
            setProfileImage(null);
            
            // Revoke the blob URL to free memory
            if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
              URL.revokeObjectURL(profileImagePreview);
            }
            
            alert("Profile picture updated successfully! 🎉");
            
          } catch (loadError) {
            console.error("❌ New profile picture failed to load:", loadError);
            // Still update the reference, but show error
            setProfileUser(prev => ({
              ...prev,
              profilePicture: uploadedFile.$id
            }));
            setProfileImage(null);
            alert("Profile picture uploaded but there might be an issue loading it. Please refresh the page.");
          }
          
        } else {
          throw new Error("Could not generate URL for uploaded profile picture");
        }
      } else {
        throw new Error("Failed to upload image file - no file ID returned");
      }
    } catch (error) {
      console.error("💥 Error uploading profile picture:", error);
      alert(`Failed to upload profile picture: ${error.message}`);
      
      // Revert to old preview if available
      const oldFileId = localStorage.getItem(`profilePic_${currentUser.$id}`);
      if (oldFileId) {
        const oldUrl = getProfilePictureUrl(oldFileId);
        if (oldUrl) {
          setProfileImagePreview(oldUrl);
        }
      }
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const formatActivityDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const postDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (postDate.getTime() === today.getTime()) {
        return 'Today';
      } else if (postDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
      } else {
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 7) {
          return `${diffDays} days ago`;
        } else {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const formatActivityTime = (dateString) => {
    try {
      if (!dateString) return 'Unknown time';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  };

  const getUserInitials = (user) => {
    if (!user || !user.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId) => {
    if (!userId) return '#6B7280';
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handlePostClick = (post) => {
    const postIdentifier = post.slug || post.$id;
    
    if (postIdentifier) {
      console.log("🔗 Navigating to post:", postIdentifier);
      navigate(`/post/${postIdentifier}`);
    } else {
      console.error("❌ Post has no valid identifier", post);
      alert("This post cannot be opened at the moment.");
    }
  };

  const isCurrentUserProfile = !userId || userId === currentUser?.$id;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-300 mb-3">Error</h2>
          <p className="text-red-200/80 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
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
    );
  }

  return (
    <div className='w-full py-8'>
      <Container>
        {profileUser && (
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 bg-white/5 rounded-2xl border border-gray-700 backdrop-blur-sm">
            <div className="flex-shrink-0 relative group">
              {profileImagePreview ? (
                <img 
                  src={profileImagePreview} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-600 shadow-xl"
                  onError={(e) => {
                    console.error("❌ Profile image failed to load in img tag");
                    // Fallback to initials
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => console.log("✅ Profile image loaded successfully in img tag")}
                />
              ) : (
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-gray-600"
                  style={{ backgroundColor: getAvatarColor(profileUser.$id) }}
                >
                  {getUserInitials(profileUser)}
                </div>
              )}
              
              {isCurrentUserProfile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <label htmlFor="profile-picture-upload" className="cursor-pointer">
                    <div className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">
                {profileUser.name}
              </h2>
              <p className="text-gray-300 text-lg mb-4">
                {profileUser.email}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                  <span className="text-white font-semibold">
                    📝 {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                  </span>
                </div>
                {isCurrentUserProfile && profileImage && (
                  <button
                    onClick={uploadProfilePicture}
                    disabled={uploadingProfilePic}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadingProfilePic ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Profile Picture
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Show loading for posts */}
        {postsLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-semibold text-gray-300 mb-4">
              Loading posts...
            </h1>
            <p className="text-gray-400 text-lg">
              Please wait while we fetch your content
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Recent Activity
            </h3>
            <div className="bg-white/5 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
              <div className="space-y-4">
                {posts.map((post, index) => {
                  const activityDate = formatActivityDate(post.$createdAt);
                  const activityTime = formatActivityTime(post.$createdAt);
                  
                  return (
                    <div 
                      key={post.$id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-900/30 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer border border-gray-600/50"
                      onClick={() => handlePostClick(post)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                          index === 0 ? 'bg-green-400' : 
                          index === 1 ? 'bg-yellow-400' : 
                          index === 2 ? 'bg-blue-400' : 'bg-gray-400'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-lg truncate">
                            {post.title}
                          </p>
                          <p className="text-gray-400 text-sm">
                            📅 Published {activityDate} at {activityTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-400 font-semibold text-sm whitespace-nowrap bg-gray-800/50 px-3 py-1 rounded-full">
                        {index === 0 ? '🔥 Latest' : `#${index + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-gray-700">
              <span className="text-4xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-300 mb-4">
              No Posts Yet
            </h1>
            <p className="text-gray-400 text-xl mb-8 max-w-md mx-auto">
              {isCurrentUserProfile 
                ? "Start your blogging journey by creating your first post!" 
                : "This user hasn't shared any posts yet."}
            </p>
            {isCurrentUserProfile && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/add-post')}
                  className='px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-2xl'
                >
                  ✨ Create Your First Post
                </button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}

export default Profile