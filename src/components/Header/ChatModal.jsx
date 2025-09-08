import React, { useState } from 'react';
import axios from 'axios'; // Make sure axios is installed

const ChatModal = ({ onClose }) => {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResponse("");
        setCopied(false);

        try {
            const res = await axios.post('http://localhost:3000/askAi', {
                prompt: message
            });

            setResponse(res.data.text); // Assuming your backend returns { text: "..." }
        } catch (err) {
            setResponse("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }

        setMessage("");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(response)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white text-black rounded-lg p-6 w-full max-w-md shadow-lg relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl font-bold"
                >
                    &times;
                </button>

                <h2 className="text-xl font-semibold mb-4">Enter your blog post title</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-24 p-2 border border-gray-300 rounded-md resize-none"
                        placeholder="Enter your blog post title and I will generate the content for you."
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                        disabled={loading || !message.trim()}
                    >
                        {loading ? "Generating..." : "Submit"}
                    </button>
                </form>

                {/* AI Response Display */}
                {response && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Generated Content:</h3>
                        <div className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap max-h-60 overflow-auto">
                            {response}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
                        >
                            {copied ? "Copied!" : "Copy Text"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatModal;
