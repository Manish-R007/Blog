import { users } from "./config.js";

export async function getCurrentUsername(userId){
   try {
     const user = await users.get(userId)
     console.log(user.name);
     
     return user.name
   } catch (error) {
        console.log("Error in fetching the user");
        return 'Unknown'
        
   }

}