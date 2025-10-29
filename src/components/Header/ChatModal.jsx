import React, { useState } from 'react';
import axios from 'axios';

const ChatModal = ({ onClose }) => {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const cleanMarkdown = (text) => {
        if (!text) return '';
        
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1') 
            .replace(/\*(.*?)\*/g, '$1')     
            .replace(/^\s*\*\s+/gm, '• ')    
            .replace(/^#+\s+/gm, '')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResponse("");
        setCopied(false);

        try {
            const res = await axios.post('http://localhost:3000/askAi', {
                message
            });

            if (res.data.success && res.data.data) {
                const cleanedResponse = cleanMarkdown(res.data.data.text);
                setResponse(cleanedResponse);
            } else {
                setResponse("No response received from AI.");
            }
        } catch (err) {
            console.error("API Error:", err);
            if (err.response) {
                setResponse(`Error: ${err.response.data.error || 'Something went wrong'}`);
            } else if (err.request) {
                setResponse("Network error: Could not connect to server.");
            } else {
                setResponse("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }

        setMessage("");
    };

    const handleCopy = () => {
        if (response) {
            navigator.clipboard.writeText(response)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white rounded-xl w-full max-w-md shadow-xl border border-blue-400/30 relative flex flex-col max-h-[90vh]">
                
                {/* Close Button - Fixed positioning */}
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all shadow-lg hover:scale-110 z-50"
                >
                    &times;
                </button>

                {/* Header - Fixed height */}
                <div className="p-6 pb-4 flex-shrink-0">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-lg">✨</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            AI Blog Generator
                        </h2>
                        <p className="text-blue-200 mt-1 text-sm">
                            Create amazing content in seconds
                        </p>
                    </div>
                </div>

                {/* Main Content - Scrollable area */}
                <div className="flex-1 overflow-hidden px-6">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-32 p-4 bg-gray-800/50 border border-blue-400/30 rounded-lg resize-none text-white placeholder-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all"
                            placeholder="Enter your blog post title..."
                        />
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
                            disabled={loading || !message.trim()}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </div>
                            ) : (
                                "Generate Content"
                            )}
                        </button>
                    </form>

                    {/* Response Section - Scrollable */}
                    {response && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-blue-300">Generated Content:</h3>
                                <button
                                    onClick={handleCopy}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-all text-sm flex-shrink-0 ml-2"
                                >
                                    {copied ? "Copied!" : "Copy Text"}
                                </button>
                            </div>
                            <div className="bg-gray-800/50 border border-blue-400/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                    {response}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading Animation */}
                    {loading && (
                        <div className="mb-4 text-center">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-purple-500 rounded-full animate-spin mb-2"></div>
                                <p className="text-blue-300 font-medium">Creating your content...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="p-6 pt-4 border-t border-gray-700 flex-shrink-0">
                    <p className="text-gray-400 text-xs text-center">
                        💡 Tip: Be specific for better results
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;