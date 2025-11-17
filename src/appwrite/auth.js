import conf from "../conf/conf.js"
import { Client, Account, ID } from "appwrite";

export class AuthService {
    client = new Client();
    account;

    constructor(){
        this.client
        .setEndpoint(conf.appwriteUrl)
        .setProject(conf.appwriteProjectId)
        this.account = new Account(this.client)
    }

    async createAccount({email, password, name}){
        try {
            console.log("🔄 Creating account for:", email);
            
            const userAccount = await this.account.create(
                ID.unique(), 
                email, 
                password, 
                name
            );
            
            if (userAccount) {
                console.log("✅ Account created successfully, attempting login...");
                return this.login({email, password});
            } else {
                throw new Error("Failed to create account");
            }
        } catch (error) {
            console.error("❌ Account creation failed:", error);
            
            // Handle specific error cases
            let errorMessage = "Account creation failed. Please try again.";
            
            if (error.code === 409) {
                errorMessage = "An account with this email already exists. Please login instead.";
            } else if (error.code === 400) {
                if (error.message.includes('password')) {
                    errorMessage = "Password is too weak. Please use a stronger password.";
                } else if (error.message.includes('email')) {
                    errorMessage = "Invalid email format. Please check your email address.";
                }
            } else if (error.code === 429) {
                errorMessage = "Too many account creation attempts. Please try again later.";
            }
            
            throw new Error(errorMessage);
        }
    }
    
    async login({email, password}){
        try {
            console.log("🔐 Attempting login for:", email);
            
            // Create new session
            const session = await this.account.createEmailPasswordSession(email, password);
            console.log("✅ Login successful, session created");
            
            // Get current user data
            const userData = await this.account.get();
            console.log("✅ User data fetched:", userData);
            
            return {
                success: true,
                userData: userData
            };
        } catch (error) {
            console.error("❌ Login failed:", error);
            
            // Return specific error messages based on error type
            let errorMessage = "Login failed. Please check your credentials.";
            
            if (error.code === 401) {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 409) {
                errorMessage = "A session already exists. Please logout first.";
            } else if (error.code === 429) {
                errorMessage = "Too many login attempts. Please try again later.";
            } else if (error.code === 500) {
                errorMessage = "Server error. Please try again later.";
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    async forgotPassword({ email, redirectUrl }) {
    try {
        const response = await this.account.createRecovery(email, redirectUrl);
        console.log("✅ Password reset link sent:", response);
        
        return {
            success: true,
            message: "Password reset email sent. Please check your inbox."
        };
    } catch (error) {
        console.error("❌ Failed to send reset email:", error);

        let errorMessage = "Failed to send reset email. Try again later.";
        if (error.code === 404) {
            errorMessage = "Email not found. Please register first.";
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

async updatePassword({ userId, secret, newPassword }) {
        try {
            const response = await this.account.updateRecovery(userId, secret, newPassword, newPassword);
            return { success: true, message: "Password updated successfully!" };
        } catch (error) {
            console.log(error);
            return { success: false, message: "Password update failed" };
        }
    }

    
    async getCurrentUser(){
        try {
            const user = await this.account.get();
            console.log("✅ Current user fetched:", user);
            return user;
        } catch (error) {
            console.log("Appwrite service :: getCurrentUser() :: ", error);
            return null;
        }
    }
    
    async logout(){
        try {
            console.log("🔐 Logging out...");
            await this.account.deleteSessions();
            console.log("✅ Logout successful");
            return true;
        } catch (error) {
            console.log("Appwrite service :: logout() :: ", error);
            return false;
        }
    }

    // Check if user already exists before creating account
    async checkUserExists(email) {
        try {
            // Try to create a session - if it works, user exists
            const tempSession = await this.account.createEmailPasswordSession(email, 'temp-password');
            
            // If we get here, user exists but password was wrong
            await this.account.deleteSession(tempSession.$id);
            return true;
        } catch (error) {
            if (error.code === 401) {
                // User exists but password is wrong
                return true;
            } else if (error.code === 404 || error.code === 400) {
                // User doesn't exist
                return false;
            }
            // Other errors - assume user doesn't exist to be safe
            return false;
        }
    }

    getUserInitials(user) {
        if (!user || !user.name) return 'U';
        return user.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getAvatarColor(userId) {
        if (!userId) return '#6B7280';
        
        const colors = [
            '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ];
        const index = userId.charCodeAt(0) % colors.length;
        return colors[index];
    }
}

const authService = new AuthService()
export default authService