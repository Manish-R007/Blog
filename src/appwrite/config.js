
import conf from "../conf/conf"
import { Client, Databases, Storage, Query, ID } from "appwrite";


export class Service {
    client = new Client()
    databases;
    bucket;

    constructor(){
        this.client.setEndpoint(conf.appwriteUrl)
        .setProject(conf.appwriteProjectId)
        this.databases = new Databases(this.client)
        this.bucket = new Storage(this.client)
    }

    async getPost(slug){
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug)
        } catch (error) {
            console.log("Appwrite service :: getPost() :: ", error);
            return false
        }
    }

    async getPosts(queries = [Query.equal("status", "active")] ){
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, queries)
        } catch (error) {
            console.log("Appwrite service :: getPosts() :: ", error);
            return false
        }
    }

    async createPost({title, slug, content, featuredImage, status, userId}){
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title, content, featuredImage, status, userId
                }
            )
        } catch (error) {
            console.log("Appwrite service :: createPost() :: ", error);
            return false
        }
    }

    async updatePost(slug, {title, content, featuredImage, status}){
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title, content, featuredImage, status
                }
            )
        } catch (error) {
            console.log("Appwrite service :: updateDocument() :: ", error);
            return false
        }
    }

    async deletePost(slug){
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                )
            return true;    
        } catch (error) {
            console.log("Appwrite service :: deleteDocument() :: ", error);
            return false
        }
    }

    // storage service

    async uploadFile(file) {
  try {
    return await this.bucket.createFile(
      conf.appwriteBucketId,
      ID.unique(),
      file,
      ['read("any")']  // Add this for public read access
    );
  } catch (error) {
    console.log("Appwrite service :: uploadFile() :: ", error);
    return false;
  }
}

async updateFilePermissions(fileId) {
  try {
    return await this.bucket.updateFile(
      conf.appwriteBucketId,
      fileId,
      undefined,  // No name change
      ['read("any")']  // Set public read permissions
    );
  } catch (error) {
    console.error("Appwrite service :: updateFilePermissions() ::", error);
    return false;
  }
}

getFileView(fileId) {
  try {
    const url = this.bucket.getFileView(conf.appwriteBucketId, fileId);
    return url.href || url.toString(); // Ensure string URL
  } catch (error) {
    console.error("Appwrite service :: getFileView() ::", error);
    return null;
  }
}

    async deleteFile(fileId){
        try {
            return await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
                
            )
        } catch (error) {
            console.log("Appwrite service :: deleteFile() :: ", error);
            return false
        }
    }

    g// In Service.js
        getFilePreview(fileId) {
        try {
            const url = this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
            return url.href || url.toString(); // Ensure a string URL is returned
        } catch (error) {
            console.error("Appwrite service :: getFilePreview() ::", error);
            return null;
        }
        }
// Add this method inside your Service class



}


const service = new Service()
export default service;