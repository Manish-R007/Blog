import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../appwrite/auth';

const ChatModal = ({ onClose }) => {
    const [message, setMessage] = useState("");
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [userName, setUserName] = useState("");
    const [showTemplates, setShowTemplates] = useState(true);
    const [templateSelected, setTemplateSelected] = useState(false);

    // ✅ Use Railway URL for production
    const API_URL = 'https://blog-backend-7-hhhh.onrender.com';

    // Blog-specific templates - Only 4 as requested
    const blogTemplates = [
        {
            title: "📝 Complete Blog Post",
            prompt: "Write a complete blog post about:",
            placeholder: "Enter your blog topic...",
            icon: "📝",
            autoMessage: "I want to create a complete blog post. Please write a comprehensive blog post with introduction, main sections, and conclusion. Include relevant image suggestions."
        },
        {
            title: "🎯 Blog Outline",
            prompt: "Create a detailed blog outline for:",
            placeholder: "Enter your blog topic...",
            icon: "🎯",
            autoMessage: "I need a detailed blog outline. Please create a structured outline with main sections, sub-sections, and key points. Include image suggestions for each section."
        },
        {
            title: "💡 Blog Ideas",
            prompt: "Generate blog post ideas about:",
            placeholder: "Enter your niche or topic...",
            icon: "💡",
            autoMessage: "I'm looking for blog post ideas. Please generate 5-7 creative blog post ideas with titles and brief descriptions. Include relevant image ideas for each."
        },
        {
            title: "🖼️ Image Ideas",
            prompt: "Suggest images and visuals for a blog post about:",
            placeholder: "Enter your blog topic...",
            icon: "🖼️",
            autoMessage: "I need image suggestions for my blog. Please suggest 8-10 specific image ideas and visuals. Include types of images, styles, and what they should depict."
        }
    ];

    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const user = await authService.getCurrentUser();
                if (user && user.name) {
                    setUserName(user.name);
                } else {
                    setUserName("Writer");
                }
            } catch (error) {
                console.error("Error getting user info:", error);
                setUserName("Writer");
            }
        };

        getUserInfo();
    }, []);

    const cleanMarkdown = (text) => {
        if (!text) return '';
        
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/^\s*[-*]\s+/gm, '• ')
            .replace(/^\d+\.\s+/gm, '')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    };

    const formatBlogContent = (text) => {
        if (!text) return text;
        
        return text.split('\n').map((line, index) => {
            // Format section headers
            if (line.match(/^[A-Z][^.!?]*?:$/) || line.match(/^#{1,3}\s+.+$/)) {
                return (
                    <div key={index} className="font-bold text-purple-300 text-lg mt-6 mb-3 border-l-4 border-purple-500 pl-3 py-2 bg-purple-500/10 rounded-r">
                        {line.replace(/^#+\s+/, '').replace(':', '')}
                    </div>
                );
            }
            
            // Format image suggestions
            if (line.toLowerCase().includes('image') || line.toLowerCase().includes('visual') || line.includes('🖼️') || line.includes('📷')) {
                return (
                    <div key={index} className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <span className="text-blue-300 font-semibold">🖼️ {line}</span>
                    </div>
                );
            }
            
            // Format list items
            if (line.trim().startsWith('•') || line.trim().match(/^[*-]\s/)) {
                return (
                    <div key={index} className="flex items-start mb-2 ml-2">
                        <span className="text-purple-400 mr-3 mt-1 flex-shrink-0">•</span>
                        <span className="text-gray-200">{line.replace(/^[•*-]\s*/, '')}</span>
                    </div>
                );
            }
            
            // Format paragraphs
            if (line.trim()) {
                return (
                    <div key={index} className="mb-3 text-gray-200 leading-relaxed">
                        {line}
                    </div>
                );
            }
            
            return <br key={index} />;
        });
    };

    const handleTemplateClick = async (template) => {
        // Hide templates section and mark template as selected
        setShowTemplates(false);
        setTemplateSelected(true);
        
        // Set the prompt in the input field for user to customize
        setMessage(`${template.prompt} `);
        
        // Create a user message showing the template selection
        const userMessage = { 
            type: 'user', 
            content: template.autoMessage,
            timestamp: new Date() 
        };
        
        setConversation(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            // ✅ Fixed: Using API_URL variable
            const res = await axios.post(`${API_URL}/askAi`, {
                message: template.autoMessage,
                conversationHistory: []
            });

            if (res.data.success && res.data.data) {
                const cleanedResponse = cleanMarkdown(res.data.data.text);
                const aiMessage = { 
                    type: 'assistant', 
                    content: cleanedResponse, 
                    timestamp: new Date() 
                };
                setConversation(prev => [...prev, aiMessage]);
            } else {
                throw new Error('No response from AI');
            }
        } catch (err) {
            console.error("API Error:", err);
            const errorMessage = { 
                type: 'assistant', 
                content: "I apologize, but I couldn't generate content for this template. Please try again or type your specific request.", 
                timestamp: new Date() 
            };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Only allow submission if template is selected and message is not empty
        if (!templateSelected || !message.trim()) return;

        setLoading(true);
        setCopied(false);

        const userMessage = { type: 'user', content: message, timestamp: new Date() };
        setConversation(prev => [...prev, userMessage]);

        const currentMessage = message;
        setMessage("");

        try {
            const enhancedMessage = `Create blog content with image suggestions: ${currentMessage}. 
            Please provide well-structured blog content with relevant image suggestions in a professional, ready-to-publish format.`;

            // ✅ FIXED: Using API_URL instead of localhost
            const res = await axios.post(`${API_URL}/askAi`, {
                message: enhancedMessage,
                conversationHistory: conversation.map(msg => ({
                    role: msg.type === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }))
            });

            if (res.data.success && res.data.data) {
                const cleanedResponse = cleanMarkdown(res.data.data.text);
                const aiMessage = { 
                    type: 'assistant', 
                    content: cleanedResponse, 
                    timestamp: new Date() 
                };
                setConversation(prev => [...prev, aiMessage]);
            } else {
                throw new Error('No response from AI');
            }
        } catch (err) {
            console.error("API Error:", err);
            const errorMessage = { 
                type: 'assistant', 
                content: "I apologize, but I couldn't generate blog content at the moment. Please try again.", 
                timestamp: new Date() 
            };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }
    };

    const clearChat = () => {
        setConversation([]);
        setMessage("");
        setShowTemplates(true);
        setTemplateSelected(false);
    };

    const showTemplatesSection = () => {
        setShowTemplates(true);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white rounded-2xl w-full max-w-4xl shadow-2xl border border-purple-500/20 relative flex flex-col max-h-[95vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-xl">✍️</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Blog Assistant
                                </h2>
                                <p className="text-purple-200 text-sm">
                                    Templates • Content • Images
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!showTemplates && (
                                <button
                                    onClick={showTemplatesSection}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-all"
                                >
                                    Show Templates
                                </button>
                            )}
                            <button
                                onClick={clearChat}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-all"
                            >
                                Clear Chat
                            </button>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full flex items-center justify-center text-lg font-bold transition-all hover:scale-110"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>

                {/* Blog Templates Grid - Show templates until one is selected */}
                {showTemplates && (
                    <div className="p-6 border-b border-purple-500/20">
                        <h3 className="text-lg font-semibold text-purple-300 mb-4">Choose a Template to Start</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {blogTemplates.map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTemplateClick(template)}
                                    disabled={loading}
                                    className="bg-gray-800/50 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 text-left transition-all duration-300 hover:scale-105 hover:border-purple-400/50 group disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                                        {template.icon}
                                    </div>
                                    <div className="font-semibold text-purple-300 group-hover:text-purple-200 mb-1">
                                        {template.title}
                                    </div>
                                    <div className="text-xs text-purple-200/70">
                                        {template.prompt}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Area */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${showTemplates ? 'max-h-64' : 'max-h-96'}`}>
                    {conversation.length === 0 && !templateSelected ? (
                        <div className="text-center text-gray-400 py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                                <span className="text-3xl">📝</span>
                            </div>
                            <p className="text-lg font-semibold text-white mb-2">Select a Template to Begin</p>
                            <p className="text-purple-200">Choose from the templates above to start creating content</p>
                        </div>
                    ) : conversation.length === 0 && showTemplates ? (
                        <div className="text-center text-gray-400 py-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <p className="text-lg font-semibold text-white mb-2">Ready to Create</p>
                            <p className="text-purple-200">Select a template above to get started</p>
                        </div>
                    ) : (
                        conversation.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-4 ${
                                        msg.type === 'user'
                                            ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                                            : 'bg-gray-800/80 text-gray-200 border border-purple-500/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-semibold ${
                                            msg.type === 'user' ? 'text-purple-100' : 'text-green-400'
                                        }`}>
                                            {msg.type === 'user' ? (userName || 'You') : 'Blog AI'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed">
                                        {msg.type === 'assistant' ? formatBlogContent(msg.content) : msg.content}
                                    </div>
                                    {msg.type === 'assistant' && (
                                        <button
                                            onClick={() => handleCopy(msg.content)}
                                            className="mt-3 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-all flex items-center gap-1"
                                        >
                                            📋 {copied ? 'Copied!' : 'Copy Content'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800/80 text-gray-200 rounded-2xl p-4 border border-purple-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-sm text-purple-300">Creating your blog content...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area - Only show after template is selected */}
                {templateSelected && (
                    <div className="p-6 border-t border-purple-500/20">
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="flex-1 p-4 bg-gray-800/80 border border-purple-500/30 rounded-xl text-white placeholder-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all"
                                placeholder="Continue the conversation or ask for modifications..."
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                disabled={loading || !message.trim()}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Send'
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatModal;