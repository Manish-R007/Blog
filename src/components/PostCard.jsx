import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import appwriteService from "../appwrite/config.js";
import { useSelector } from "react-redux";

function PostCard({ $id, title, slug, featuredImage, createdAt, userId, userName, userEmail }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [authorImageUrl, setAuthorImageUrl] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 100));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [authorImageLoaded, setAuthorImageLoaded] = useState(false);
  
  const currentUser = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImageUrls = async () => {
      // Fetch post featured image
      if (featuredImage) {
        const url = appwriteService.getFileView(featuredImage);
        setImageUrl(url);
      }

      // Fetch author's profile picture
      try {
        const authorProfilePicId = localStorage.getItem(`profilePic_${userId}`);
        if (authorProfilePicId) {
          const authorUrl = appwriteService.getFileView(authorProfilePicId);
          setAuthorImageUrl(authorUrl);
        }
      } catch (error) {
        console.log("ℹ️ No profile picture found for author:", userId);
      }
    };
    
    fetchImageUrls();
  }, [featuredImage, userId]);

  const author = {
    name: userName || "Unknown User",
    email: userEmail || "unknown@example.com",
    $id: userId
  };

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Unknown date';

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleCardClick = () => {
    console.log("🔗 Navigating to post with slug:", slug);
    
    if (slug) {
      navigate(`/post/${slug}`);
    } else {
      console.warn("⚠️ No slug available, using document ID as fallback");
      navigate(`/post/${$id}`);
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

  return (
    <div 
      onClick={handleCardClick}
      className="relative w-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer group"
    >
      {/* Image container with better aspect ratio */}
      <div className="w-full mb-4 overflow-hidden rounded-xl bg-slate-600">
        {imageUrl ? (
          <div className="relative h-48 w-full">
            <img 
              src={imageUrl} 
              alt={title} 
              className={`w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)} // If image fails to load, still show the element
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700">
            <span className="text-slate-300">No Image</span>
          </div>
        )}
      </div>
      
      {/* Content area */}
      <div className="flex flex-col flex-grow">
        <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight min-h-[2.5rem]">
          {title || "Untitled Post"}
        </h2>
        
        <div className="text-xs text-gray-400 mb-3">
          Created on: {formattedDate}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-600">
          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={handleAvatarClick}
          >
            {/* Author Profile Picture */}
            <div className="relative">
              {authorImageUrl ? (
                <div className="relative">
                  <img 
                    src={authorImageUrl} 
                    alt={`${author.name}'s profile`}
                    className={`w-7 h-7 rounded-full object-cover shadow-md transition-transform hover:scale-110 cursor-pointer flex-shrink-0 border-2 border-white/20 ${
                      authorImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setAuthorImageLoaded(true)}
                    onError={() => {
                      console.log("❌ Author profile image failed to load");
                      setAuthorImageLoaded(false);
                      setAuthorImageUrl(null); // Clear the URL if it fails to load
                    }}
                  />
                  {!authorImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                           style={{ backgroundColor: getAvatarColor(userId) }}>
                        {getUserInitials(author)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-transform hover:scale-110 cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: getAvatarColor(userId) }}
                >
                  {getUserInitials(author)}
                </div>
              )}
            </div>
            
            <span className="text-sm text-gray-300 truncate">
              By: {author.name}
            </span>
          </div>

          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all flex-shrink-0 ${
              isLiked 
                ? "bg-rose-500/90 text-rose-100" 
                : "bg-slate-600/70 hover:bg-rose-500/90"
            }`}
          >
            {isLiked ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            )}
            <span className="text-xs font-medium">{likesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostCard;