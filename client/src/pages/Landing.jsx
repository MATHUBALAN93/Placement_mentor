import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Code, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-200">
                        A
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        Antigravity<span className="text-purple-600">.prep</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 shadow-lg shadow-purple-100 transition duration-200"
                        >
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 transition">
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 shadow-lg shadow-purple-100 transition duration-200"
                            >
                                Sign Up Free
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5 text-xs font-semibold text-purple-600 mb-6">
                    🚀 Production-Grade AI Placement Mentor
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-905 tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
                    Ace Your Placements with{' '}
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Personalized AI Coaching
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The radically simple preparation platform. Know your readiness under 5 seconds. Learn with adaptive dynamic tracks, ATS CV matching, and AI mock interviews.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fadeIn">
                    <Link
                        to={user ? "/dashboard" : "/register"}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-8 py-4 text-base font-semibold text-white hover:bg-purple-700 shadow-xl shadow-purple-100 transition duration-200"
                    >
                        Get Started Instantly
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                    <a
                        href="#features"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 px-8 py-4 text-base font-semibold text-gray-700 transition"
                    >
                        See Core Features
                    </a>
                </div>

                {/* Feature grid */}
                <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-100 text-left">
                    <div className="p-6 rounded-3xl border border-gray-50 bg-gray-55/20 hover:shadow-md transition">
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                            <Code className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Adaptive Problem Sets</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Our system adapts to your current programming skills, recommending problems dynamically that target your weakness.
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl border border-gray-50 bg-gray-55/20 hover:shadow-md transition">
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Generative AI Mock Rounds</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Experience realistic dialogues with our voice/text interview bot that reviews and highlights weaknesses in your answer delivery.
                        </p>
                    </div>

                    <div className="p-6 rounded-3xl border border-gray-50 bg-gray-55/20 hover:shadow-md transition">
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
                            <Award className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">ATS Resume Matcher</h3>
                        <p className="text-sm text-gray-550 leading-relaxed">
                            Upload your CV directly under our scanner to check compatibility scores against pasting job advertisements immediately.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer footer */}
            <footer className="bg-gray-50 py-8 border-t border-gray-150/50">
                <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} Antigravity Systems. Built as a radically simple placement companion.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
