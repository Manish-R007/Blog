import conf from '../conf/conf';
import { Client, Databases, Storage, Query, ID } from "appwrite";

export class Service {
    client = new Client();
    databases;
    storage;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
    }

    // Get post by slug (query by slug field)
    async getPost(slug) {
        try {
            console.log("🔄 Getting post with slug:", slug);
            
            // Query documents where slug equals the provided slug
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId, 
                conf.appwriteCollectionId,
                [Query.equal("slug", slug)]
            );
            
            if (result.documents.length > 0) {
                console.log("✅ Post found by slug:", result.documents[0]);
                return result.documents[0];
            } else {
                console.log("❌ No post found with slug:", slug);
                return null;
            }
        } catch (error) {
            console.log("❌ Appwrite service :: getPost() :: ", error);
            console.log("❌ Error details:", {
                message: error.message,
                code: error.code,
                type: error.type
            });
            return null;
        }
    }

    // Get post by document ID (for editing)
    async getPostById(id) {
        try {
            console.log("🔄 Getting post with document ID:", id);
            const result = await this.databases.getDocument(
                conf.appwriteDatabaseId, 
                conf.appwriteCollectionId, 
                id
            );
            console.log("✅ Post found by ID:", result);
            return result;
        } catch (error) {
            console.log("❌ Appwrite service :: getPostById() :: ", error);
            return null;
        }
    }

    // Create post - let Appwrite generate the $id automatically
    async createPost({title, slug, content, featuredImage, status, userId, userName, userEmail}){
        try {
            console.log("🔄 Creating new post with slug:", slug);
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                ID.unique(), // Let Appwrite generate unique document ID
                {
                    title, 
                    slug,
                    content, 
                    featuredImage, 
                    status, 
                    userId,
                    userName,
                    userEmail
                }
            )
        } catch (error) {
            console.log("Appwrite service :: createPost() :: ", error);
            throw error;
        }
    }

    // Update post - use document ID ($id) for updates
    async updatePost(id, { title, slug, content, featuredImage, status, userId, userName, userEmail, userProfilePicture }) {
        try {
            console.log("🔄 Updating post with document ID:", id);
            
            const updateData = {
                title,
                slug,
                content,
                featuredImage,
                status
            };

            // Include user fields if provided
            if (userId) updateData.userId = userId;
            if (userName) updateData.userName = userName;
            if (userEmail) updateData.userEmail = userEmail;
            if (userProfilePicture !== undefined) updateData.userProfilePicture = userProfilePicture;

            const result = await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                id, // Use the document ID ($id)
                updateData
            );
            console.log("✅ Post updated successfully:", result);
            return result;
        } catch (error) {
            console.log("❌ Appwrite service :: updatePost() :: ", error);
            throw error;
        }
    }

    // Delete post - use document ID ($id)
    async deletePost(id) {
        try {
            console.log("🔄 Deleting post with document ID:", id);
            
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                id // Use the document ID ($id)
            );
            console.log("✅ Post deleted successfully");
            return true;
        } catch (error) {
            console.log("❌ Appwrite service :: deletePost() :: ", error);
            throw error;
        }
    }

    // Get posts with pagination
    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            console.log("🔄 Getting posts with queries:", queries);
            
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
            console.log("✅ Posts fetched:", result.documents.length);
            return result;
        } catch (error) {
            console.log("❌ Appwrite service :: getPosts() :: ", error);
            return null;
        }
    }

    // File upload methods - IMPROVED VERSION
    async uploadFile(file) {
        try {
            console.log("🔄 Uploading file:", {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error("File size exceeds 5MB limit");
            }

            // Validate file type for images
            if (!file.type.startsWith('image/')) {
                throw new Error("Only image files are allowed");
            }

            const result = await this.storage.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file
            );
            
            console.log("✅ File uploaded successfully:", {
                fileId: result.$id,
                bucketId: conf.appwriteBucketId
            });
            return result;
        } catch (error) {
            console.log("❌ Appwrite service :: uploadFile() :: ", {
                message: error.message,
                code: error.code,
                type: error.type
            });
            throw error;
        }
    }

    async deleteFile(fileId) {
        try {
            console.log("🔄 Deleting file:", fileId);
            
            // First check if file exists
            const fileExists = await this.checkFileExists(fileId);
            if (!fileExists) {
                console.log("ℹ️ File doesn't exist, nothing to delete");
                return true;
            }
            
            await this.storage.deleteFile(
                conf.appwriteBucketId,
                fileId
            );
            console.log("✅ File deleted successfully");
            return true;
        } catch (error) {
            console.log("❌ Appwrite service :: deleteFile() :: ", {
                message: error.message,
                code: error.code,
                type: error.type
            });
            return false;
        }
    }

    getFilePreview(fileId, width = 400, height = 400, quality = 90) {
        try {
            if (!fileId) {
                console.log("❌ No fileId provided for preview");
                return null;
            }
            
            console.log("🔄 Getting file preview for:", fileId);
            
            const result = this.storage.getFilePreview(
                conf.appwriteBucketId,
                fileId,
                width,
                height,
                undefined, // gravity
                quality,
                undefined, // borderWidth
                undefined, // borderColor
                undefined, // borderRadius
                undefined, // opacity
                undefined, // rotation
                undefined, // background
                undefined  // output
            );
            console.log("✅ File preview URL generated:", result);
            return result;
        } catch (error) {
            console.log("❌ Appwrite service :: getFilePreview() :: ", error);
            return null;
        }
    }

    getFileView(fileId) {
        try {
            if (!fileId) {
                console.log("❌ No fileId provided for file view");
                return null;
            }
            
            console.log("🔄 Getting file view for:", fileId);
            
            const result = this.storage.getFileView(
                conf.appwriteBucketId,
                fileId
            );
            console.log("✅ File view URL generated:", result);
            return result;
        } catch (error) {
            console.log("❌ Appwrite service :: getFileView() :: ", error);
            return null;
        }
    }

    getFileDownload(fileId) {
        try {
            if (!fileId) {
                console.log("❌ No fileId provided for download");
                return null;
            }
            
            console.log("🔄 Getting file download for:", fileId);
            
            const result = this.storage.getFileDownload(
                conf.appwriteBucketId,
                fileId
            );
            console.log("✅ File download URL generated:", result);
            return result;
        } catch (error) {
            console.log("❌ Appwrite service :: getFileDownload() :: ", error);
            return null;
        }
    }

    async checkFileExists(fileId) {
        try {
            if (!fileId) {
                console.log("❌ No fileId provided for existence check");
                return false;
            }
            
            console.log("🔍 Checking if file exists:", fileId);
            const file = await this.storage.getFile(
                conf.appwriteBucketId,
                fileId
            );
            console.log("✅ File exists:", !!file);
            return !!file;
        } catch (error) {
            console.log("❌ File does not exist or error:", {
                message: error.message,
                code: error.code,
                type: error.type
            });
            return false;
        }
    }

    // Add this method to get file information
    async getFileInfo(fileId) {
        try {
            if (!fileId) return null;
            
            const file = await this.storage.getFile(
                conf.appwriteBucketId,
                fileId
            );
            return file;
        } catch (error) {
            console.log("❌ Appwrite service :: getFileInfo() :: ", error);
            return null;
        }
    }
}

const appwriteService = new Service();
export default appwriteService;