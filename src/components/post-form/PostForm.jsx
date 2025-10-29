import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../Button";
import Input from "../Input";
import RTE from "../RTE";
import Select from "../Select";
import appwriteService from "../../appwrite/config";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues, formState: { errors } } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.slug || "",
            content: post?.content || "",
            status: post?.status || "active"
        }
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const submit = async (data) => {
        console.log("🔄 Submitting form data:", data);
        setLoading(true);
        
        try {
            if (post) {
                // EDIT MODE
                let file = null;
                let shouldUpdateImage = false;

                // Check if a new image was provided
                if (data.image && data.image.length > 0 && data.image[0]) {
                    console.log("🔄 Uploading new image...");
                    file = await appwriteService.uploadFile(data.image[0]);
                    shouldUpdateImage = true;
                    
                    // Delete old image only after successful upload
                    if (file && post.featuredImage) {
                        console.log("🔄 Deleting old image:", post.featuredImage);
                        try {
                            await appwriteService.deleteFile(post.featuredImage);
                        } catch (deleteError) {
                            console.warn("⚠️ Could not delete old image:", deleteError);
                            // Continue with update even if old image deletion fails
                        }
                    }
                }

                // Prepare update data
                const updateData = {
                    title: data.title || post.title, // Fallback to existing title
                    slug: data.slug || post.slug,    // Fallback to existing slug
                    content: data.content,
                    status: data.status
                };

                // Add featured image if updated
                if (shouldUpdateImage && file) {
                    updateData.featuredImage = file.$id;
                }

                console.log("🔄 Updating post with data:", updateData);
                const dbPost = await appwriteService.updatePost(post.$id, updateData);

                if (dbPost) {
                    console.log("✅ Post updated successfully");
                    navigate(`/post/${dbPost.slug}`);
                } else {
                    throw new Error("Failed to update post");
                }
            } else {
                // CREATE MODE
                if (!data.image || data.image.length === 0 || !data.image[0]) {
                    alert("Please select a featured image");
                    setLoading(false);
                    return;
                }

                if (!data.slug || data.slug.trim() === '') {
                    alert("Slug is required. Please make sure the title field is filled out properly.");
                    setLoading(false);
                    return;
                }

                if (!data.title || data.title.trim() === '') {
                    alert("Title is required");
                    setLoading(false);
                    return;
                }

                console.log("🔄 Uploading featured image...");
                const file = await appwriteService.uploadFile(data.image[0]);
                
                if (file) {
                    console.log("🔄 Creating new post with slug:", data.slug);
                    
                    const dbPost = await appwriteService.createPost({
                        title: data.title.trim(),
                        slug: data.slug.trim(),
                        content: data.content,
                        status: data.status,
                        featuredImage: file.$id,
                        userId: userData.$id,
                        userName: userData.name || userData.email?.split('@')[0] || 'Anonymous',
                        userEmail: userData.email || 'unknown@example.com'
                    });

                    if (dbPost) {
                        console.log("✅ Post created successfully");
                        navigate(`/post/${dbPost.slug}`);
                    } else {
                        throw new Error("Failed to create post");
                    }
                } else {
                    throw new Error("Failed to upload image");
                }
            }
        } catch (error) {
            console.error("💥 Form submission error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string") {
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, '-')
                .replace(/\s/g, "-")
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
        return "";
    }, []);

    // Handle image preview for new images
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        } else {
            setImagePreview(null);
        }
    };

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    // Clean up image preview URLs
    React.useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <form onSubmit={handleSubmit(submit)} className="w-full">
            {/* Header Section */}
            <div className="mb-8 text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-xl ${
                    post 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                    <span className="text-2xl text-white">
                        {post ? '✏️' : '📝'}
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    {post ? 'Edit Post' : 'Create New Post'}
                </h1>
                <p className="text-gray-300 text-lg">
                    {post ? 'Update your post content and details' : 'Share your thoughts with the world'}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Form Fields */}
                <div className="flex-1 space-y-6">
                    {/* Title Input */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                        <label className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Title {!post && '*'}
                        </label>
                        <Input
                            placeholder="Enter a captivating title for your post..."
                            className="w-full text-lg py-4 bg-gray-700/30 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                            {...register("title", { 
                                required: !post ? "Title is required" : false,
                                minLength: {
                                    value: 3,
                                    message: "Title must be at least 3 characters"
                                }
                            })}
                            disabled={loading}
                        />
                        {errors.title && (
                            <p className="text-red-400 text-sm mt-2">{errors.title.message}</p>
                        )}
                        {post && (
                            <p className="text-gray-400 text-sm mt-2">
                                Leave unchanged to keep current title
                            </p>
                        )}
                    </div>

                    {/* Slug Input */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                        <label className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Slug {!post && '*'}
                        </label>
                        <div className="relative">
                            <Input
                                placeholder="Auto-generated from title..."
                                className="w-full text-lg py-4 bg-gray-700/30 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 font-mono"
                                {...register("slug", { 
                                    required: !post ? "Slug is required" : false,
                                    pattern: {
                                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                        message: "Slug can only contain lowercase letters, numbers, and hyphens"
                                    }
                                })}
                                onInput={(e) => {
                                    setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                                }}
                                disabled={loading}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <span className="text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded-md">
                                    URL
                                </span>
                            </div>
                        </div>
                        {errors.slug && (
                            <p className="text-red-400 text-sm mt-2">{errors.slug.message}</p>
                        )}
                        {post && (
                            <p className="text-gray-400 text-sm mt-2">
                                Leave unchanged to keep current slug
                            </p>
                        )}
                    </div>

                    {/* Content Editor */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                        <label className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Content {!post && '*'}
                        </label>
                        <RTE
                            name="content"
                            control={control}
                            defaultValue={getValues("content")}
                            className="min-h-[300px]"
                            disabled={loading}
                        />
                        {post && (
                            <p className="text-gray-400 text-sm mt-2">
                                Update only the content you want to change
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="lg:w-96 space-y-6">
                    {/* Featured Image */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                        <label className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            Featured Image {!post && '*'}
                        </label>
                        <div className="space-y-4">
                            <Input
                                type="file"
                                className="w-full py-3 bg-gray-700/30 border-gray-600 file:bg-gradient-to-r file:from-yellow-500 file:to-orange-500 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 hover:file:from-yellow-600 hover:file:to-orange-600 transition-all duration-300"
                                accept="image/png, image/jpg, image/jpeg, image/webp"
                                {...register("image", { 
                                    required: !post ? "Featured image is required" : false 
                                })}
                                onChange={handleImageChange}
                                disabled={loading}
                            />
                            
                            {/* Image Preview */}
                            {(imagePreview || post?.featuredImage) && (
                                <div className="space-y-3">
                                    <div className="relative group">
                                        <img
                                            src={imagePreview || appwriteService.getFileView(post.featuredImage)}
                                            alt={post?.title || "Preview"}
                                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-600 group-hover:border-yellow-500 transition-all duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {imagePreview ? "New Image Preview" : "Current Image"}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm text-center">
                                        {imagePreview 
                                            ? "This is how your new image will appear" 
                                            : post 
                                                ? "Upload a new image to replace this one" 
                                                : "This image will be displayed as your post thumbnail"
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                        {errors.image && (
                            <p className="text-red-400 text-sm mt-2">{errors.image.message}</p>
                        )}
                        {post && (
                            <p className="text-gray-400 text-sm mt-2 ml-3">
                                Optional: Only upload if you want to change the image
                            </p>
                        )}
                    </div>

                    {/* Status Selector */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                        <label className="text-white text-lg font-semibold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            Status {!post && '*'}
                        </label>
                        <Select
                            options={["active", "inactive"]} 
                            className="w-full py-3 bg-gray-700/30 border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            {...register("status", { required: !post ? true : false })}
                            disabled={loading}
                        />
                        {post && (
                            <p className="text-gray-400 text-sm mt-2">
                                Change post visibility status
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 backdrop-blur-sm">
                        <Button
                            type="submit"
                            bgColor={loading 
                                ? "bg-gray-600 cursor-not-allowed" 
                                : post 
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            }
                            className="w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                            disabled={loading}
                        >
                            <div className="flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {post ? 'Updating...' : 'Publishing...'}
                                    </>
                                ) : post ? (
                                    <>
                                        <span>💾</span>
                                        Update Post
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        Publish Post
                                    </>
                                )}
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {post ? 'Updating Post' : 'Creating Post'}
                            </h3>
                            <p className="text-gray-300">
                                {post 
                                    ? 'Saving your changes...' 
                                    : 'Publishing your amazing content...'
                                }
                            </p>
                            <div className="mt-4 flex justify-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}