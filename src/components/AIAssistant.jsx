import React, { useState } from "react";

const AIAssistant = ({ open, onClose }) => {
  const [title, setTitle] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    
    setLoading(true);
    setResponse("");
    setError("");
    
    try {
      const endpoint = "http://localhost:5000/generate";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: title.trim() })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.content) {
        setResponse(data.content);
      } else {
        setError("Sorry, could not generate content. Try again later.");
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setError("Network error: Cannot connect to the AI service. Check your connection.");
      } else {
        setError("Error: " + (err.message || "Failed to generate content"));
      }
    }
    setLoading(false);
  };

  const handleClose = () => {
    setTitle("");
    setResponse("");
    setError("");
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
          onClick={handleClose}
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-slate-900">AI Assistant Chatbot</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mb-1 text-black focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            disabled={loading}
            maxLength={100}
          />
          <div className="text-xs text-gray-500 text-right mb-2">
            {title.length}/100 characters
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-2">
              {error}
              <button 
                onClick={handleSubmit}
                className="ml-2 text-blue-500 underline"
              >
                Try again
              </button>
            </div>
          )}
          
          <button
            type="submit"
            className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : "Generate Content"}
          </button>
        </form>
        {response && (
          <div className="bg-slate-100 p-4 rounded text-slate-800 whitespace-pre-line">
            <h3 className="font-semibold mb-2">Generated Content:</h3>
            {response}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;