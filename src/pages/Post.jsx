import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import Button from "../components/Button";
import Container from "../components/container/Container";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

function Post() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const rawUserData = useSelector((state) => state.auth.userData);
  const userData = rawUserData?.userData || rawUserData;
  
  const isAuthor = post && userData ? post.userId === userData.$id : false;

  // Enhanced deletePost function with better error handling
  const deletePost = async () => {
    if (!post) {
      console.error("❌ No post data available for deletion");
      alert("Cannot delete post: Post data not available");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      console.log("🗑️ Attempting to delete post:", {
        postId: post.$id,
        title: post.title,
        slug: post.slug
      });
      
      // Delete the post using Appwrite service
      const success = await appwriteService.deletePost(post.$id);
      
      if (success) {
        console.log("✅ Post deleted successfully");
        
        // Optional: Also delete the featured image if it exists
        if (post.featuredImage) {
          try {
            await appwriteService.deleteFile(post.featuredImage);
            console.log("✅ Featured image deleted successfully");
          } catch (imageError) {
            console.warn("⚠️ Could not delete featured image:", imageError);
          }
        }
        
        // Show success message and redirect
        alert("Post deleted successfully!");
        navigate("/");
      } else {
        throw new Error('Appwrite service returned false');
      }
    } catch (err) {
      console.error("💥 Error deleting post:", err);
      const errorMessage = err.message || "Failed to delete post. Please try again.";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    console.log("🔍 Post component mounted");
    console.log("🔍 Slug from URL:", slug);
    
    const fetchPost = async () => {
      if (!slug) {
        console.log("❌ No slug provided, redirecting to home");
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError("");
        setImageError(false);
        console.log("🔄 Fetching post with slug:", slug);
        
        const postData = await appwriteService.getPost(slug);
        console.log("🔍 Post data received:", postData);
        
        if (postData) {
          console.log("✅ Post fetched successfully");
          console.log("📋 Post structure:", {
            id: postData.$id,
            slug: postData.slug,
            title: postData.title,
            userId: postData.userId,
            featuredImage: postData.featuredImage,
            createdAt: postData.$createdAt
          });
          
          setPost(postData);
          
          // Generate image URL
          if (postData.featuredImage) {
            try {
              console.log("🖼️ Attempting to generate image URL for file:", postData.featuredImage);
              const viewUrl = appwriteService.getFileView(postData.featuredImage);
              console.log("🔗 Generated view URL:", viewUrl);
              setImageUrl(viewUrl);
            } catch (imageError) {
              console.error("❌ Error generating image URL:", imageError);
              setImageError(true);
            }
          } else {
            console.log("ℹ️ No featured image for this post");
            setImageError(true);
          }
        } else {
          console.log("❌ Post not found or returned false");
          setError("Post not found. It may have been deleted or the link is incorrect.");
        }
      } catch (err) {
        console.error("💥 Error fetching post:", err);
        setError("Failed to load post. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen py-14 px-4 flex justify-center bg-gradient-to-br from-[#101820] via-[#152232] to-[#0e1724] text-gray-100">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-red-300 mb-3">Error</h2>
              <p className="text-red-200/80 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate("/")}
                  bgColor="bg-blue-500 hover:bg-blue-600"
                  className="text-white px-6 py-2 rounded-lg"
                >
                  🏠 Go Home
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  bgColor="bg-gray-600 hover:bg-gray-700"
                  className="text-white px-6 py-2 rounded-lg"
                >
                  🔄 Try Again
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen py-14 px-4 flex justify-center bg-gradient-to-br from-[#101820] via-[#152232] to-[#0e1724] text-gray-100">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl overflow-hidden border border-blue-400/20 bg-gradient-to-b from-[#16273d]/90 to-[#0f1c2d]/95 backdrop-blur-xl">
              <div className="w-full h-80 bg-gray-700/50 animate-pulse rounded-t-3xl"></div>
              <div className="p-10 space-y-6">
                <div className="text-center space-y-4">
                  <div className="h-8 bg-gray-600/50 rounded-lg animate-pulse w-3/4 mx-auto"></div>
                  <div className="h-6 bg-gray-600/50 rounded-lg animate-pulse w-1/2 mx-auto"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-600/50 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-600/50 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-600/50 rounded animate-pulse w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return post ? (
    <div className="min-h-screen py-14 px-4 flex justify-center bg-gradient-to-br from-[#101820] via-[#152232] to-[#0e1724] text-gray-100">
      <Container>
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-blue-400/20 shadow-[0_0_50px_rgba(0,0,0,0.4)] bg-gradient-to-b from-[#16273d]/90 to-[#0f1c2d]/95 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_80px_rgba(0,180,255,0.25)] hover:border-blue-500/30">
          
          {/* Hero Image */}
          <div className="relative">
            {imageUrl && !imageError ? (
              <div className="w-full max-h-[500px] overflow-hidden rounded-t-3xl">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover opacity-95"
                  onError={(e) => {
                    console.error("❌ Image failed to load from URL:", imageUrl);
                    setImageError(true);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => console.log("✅ Image loaded successfully from:", imageUrl)}
                />
              </div>
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-gray-700 to-gray-800 rounded-t-3xl flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <span className="text-4xl mb-2 block">🖼️</span>
                  <p>Featured Image</p>
                  <p className="text-sm mt-2">Image not available</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c2d]/90 via-transparent to-transparent" />
            
            {/* Author Actions */}
            {userData && isAuthor && (
              <div className="absolute right-5 top-5 flex gap-3">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button
                    bgColor="bg-blue-500/90 hover:bg-blue-600"
                    className="text-white px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105 backdrop-blur-sm"
                  >
                    ✏️ Edit
                  </Button>
                </Link>
                <Button
                  bgColor="bg-red-500/90 hover:bg-red-600"
                  onClick={deletePost}
                  disabled={deleting}
                  className="text-white px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </div>
                  ) : (
                    "🗑️ Delete"
                  )}
                </Button>
              </div>
            )}

            
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-10 bg-gradient-to-br from-[#192a3c]/90 via-[#152536]/90 to-[#0e1b2a]/90 text-gray-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-300 mb-6 tracking-wide drop-shadow-[0_0_10px_rgba(0,150,255,0.3)] leading-tight">
              {post.title}
            </h1>

            <div className="browser-css text-gray-200 leading-relaxed text-[1.05rem] space-y-6 transition-all duration-500">
              {parse(post.content)}
            </div>

            {/* Divider Glow */}
            <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent mx-auto my-10" />

            {/* Author Info */}
            <div className="text-center space-y-3">
              <p className="text-blue-300 font-medium text-lg">
                ✨ Written by <span className="text-blue-400 font-semibold">{post.userName || post.userEmail?.split('@')[0] || 'Anonymous'}</span>
              </p>
              {post.userEmail && (
                <p className="text-blue-300/60 text-sm">{post.userEmail}</p>
              )}
              <p className="text-blue-300/40 text-xs">
                📅 Published on {post.$createdAt ? new Date(post.$createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : 'Unknown date'}
              </p>
            </div>


            {/* Back to home button */}
            <div className="text-center mt-8">
              <Button
                onClick={() => navigate("/")}
                bgColor="bg-blue-600/80 hover:bg-blue-700"
                className="text-white px-6 py-3 rounded-lg transition-all hover:scale-105"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  ) : null;
}

export default Post;