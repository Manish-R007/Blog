// store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Get initial state from localStorage if available
const getInitialState = () => {
  try {
    const storedAuth = localStorage.getItem('authState');
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      console.log("🔄 Restoring auth state from localStorage:", parsedAuth);
      return parsedAuth;
    }
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
  }
  return {
    status: false,
    userData: null
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      console.log("🔄 authSlice - login action payload:", action.payload);
      state.status = true;
      state.userData = action.payload.userData || action.payload;
      console.log("✅ authSlice - userData after login:", state.userData);
      
      // Save to localStorage
      try {
        localStorage.setItem('authState', JSON.stringify(state));
        console.log("💾 Auth state saved to localStorage");
      } catch (error) {
        console.error("Error saving auth state to localStorage:", error);
      }
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      console.log("✅ authSlice - user logged out");
      
      // Remove from localStorage
      try {
        localStorage.removeItem('authState');
        console.log("🗑️ Auth state removed from localStorage");
      } catch (error) {
        console.error("Error removing auth state from localStorage:", error);
      }
    },
    initializeAuth: (state, action) => {
      // This action can be used to initialize auth state on app start
      if (action.payload) {
        state.status = action.payload.status;
        state.userData = action.payload.userData;
      }
    }
  }
});

export const { login, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;