import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api.js';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

const AIMentor = () => {
    const [messages, setMessages] = useState([
        {
            role: 'system',
            text: "Hi there! I'm your Antigravity Placement Mentor. I can help you understand algorithms, review code concepts, suggest roadmap items, or explain job matching strategies. What would you like to focus on today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorDetails, setErrorDetails] = useState('');

    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setErrorDetails('');

        // Add user message to UI immediately
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            // Create context block (last 5 messages for brevity)
            const messageHistory = messages.map(m => m.text).join('\n---\n');

            const res = await api.post('/ai/mentor-chat', {
                prompt: userMessage,
                contextInfo: messageHistory
            });

            const reply = res.data.data.reply;

            setMessages(prev => [...prev, { role: 'system', text: reply }]);
        } catch (err) {
            setErrorDetails('Failed to reach AI Core. Please try again.');
            setMessages(prev => [...prev, { role: 'system', text: "⚠️ Network Error: Unable to process your last request via the AI core engine." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-fadeIn">
            {/* Header */}
            <div className="bg-white p-6 rounded-t-3xl border border-gray-100/50 shadow-sm z-10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-100">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-901">Antigravity AI Mentor</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Always-on intelligent placement companion</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Mentor Online</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-6 border-x border-gray-100/50">
                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div key={idx} className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isUser ? 'bg-gray-800 text-white' : 'bg-purple-100 text-purple-700'}`}>
                                {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser ? 'bg-white text-gray-800 rounded-tr-sm border border-gray-100' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-tl-sm'}`}>
                                <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex gap-4 max-w-3xl">
                        <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div className="p-4 rounded-2xl bg-white text-gray-500 rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2">
                            <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></span>
                            <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 rounded-b-3xl border border-gray-100/50 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)] shrink-0">
                {errorDetails && (
                    <div className="mb-3 rounded-xl bg-red-50 p-2 text-xs font-medium text-red-650 border border-red-200">
                        {errorDetails}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="Ask about dynamic programming, ATS keywords, or resume help..."
                        className="flex-1 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 py-4 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition shadow-inner disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 h-10 w-10 md:h-12 md:w-12 md:relative md:right-auto flex items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition disabled:bg-purple-300 shadow-lg shadow-purple-100"
                    >
                        <Send className="h-5 w-5 -ml-0.5 mt-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIMentor;
