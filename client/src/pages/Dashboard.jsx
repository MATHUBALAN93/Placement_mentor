import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { Award, Flame, Target, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorDetails, setErrorDetails] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/users/dashboard');
            setStats(res.data.data);
            setLoading(false);
        } catch (err) {
            setErrorDetails(err.response?.data?.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    const handleActionClick = (route) => {
        navigate(route);
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (errorDetails) {
        return (
            <div className="rounded-2xl bg-red-50 p-6 text-sm font-medium text-red-650 border border-red-100 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                    <p className="font-bold">Error loading dashboard</p>
                    <p className="text-xs text-red-500 mt-1">{errorDetails}</p>
                </div>
            </div>
        );
    }

    const { kpis, readiness, weakestSkills, continueActions, streakLog } = stats;

    return (
        <div className="space-y-8 pb-12">
            {/* Target summary welcome notification banner */}
            <div className="rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 p-8 text-white shadow-xl shadow-purple-100">
                <div className="max-w-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-widest bg-purple-800 px-3 py-1 rounded-full text-purple-200">
                        AI Placement Mentor Insights
                    </span>
                    <h2 className="text-2xl font-bold mt-4 mb-2">Your Placement Summary Status</h2>
                    <p className="text-purple-100 text-sm leading-relaxed">
                        {readiness?.statusLine || "Take your initial assessment to formulate your readiness index."}
                    </p>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Readiness Score', value: `${readiness?.score || 0}%`, icon: Target, color: 'text-purple-600 bg-purple-50' },
                    { label: 'Problems Solved', value: kpis?.problemsSolved || 0, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Global Accuracy', value: `${kpis?.accuracy || 0}%`, icon: Award, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Daily Streak', value: `${kpis?.streak || 0} Days`, icon: Flame, color: 'text-amber-600 bg-amber-50' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100/50 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${item.color} shrink-0`}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 capitalize">{item.label}</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main split sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left 2 cols: continue actions & analytics chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-905 mb-4">Continue Learning</h3>

                        <div className="space-y-3">
                            {continueActions.map((action, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-5 rounded-2xl border border-gray-100/50 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4"
                                >
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{action.actionName}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleActionClick(action.route)}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200 px-4 py-2 text-xs font-semibold text-purple-600 shrink-0 transition"
                                    >
                                        {action.ctaText}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prep Consistency Grid */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100/50 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-2">Practice Consistency Index</h3>
                        <p className="text-xs text-gray-500 mb-4">Complete coding problems daily to track streaks. Active days out of last 30.</p>

                        <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                                style={{ width: `${readiness?.breakdown?.consistency || 10}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Low Activity</span>
                            <span className="font-semibold text-purple-600">Score: {readiness?.breakdown?.consistency || 10}/100</span>
                            <span>Highly Consistent</span>
                        </div>
                    </div>
                </div>

                {/* Right col: Gauge Circle & Weaknesses */}
                <div className="space-y-6">
                    {/* Circular Placement Readiness Score Gauge */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-105 shadow-sm text-center flex flex-col items-center justify-center">
                        <h3 className="text-sm font-bold text-gray-800 mb-6">Placement Readiness</h3>

                        <div className="relative flex items-center justify-center">
                            {/* SVG Ring Gauge */}
                            <svg className="w-36 h-36 transform -rotate-90">
                                <circle
                                    cx="72" cy="72" r="62"
                                    className="stroke-gray-100"
                                    strokeWidth="10"
                                    fill="none"
                                />
                                <circle
                                    cx="72" cy="72" r="62"
                                    className="stroke-purple-650 transition-all duration-500"
                                    strokeWidth="10"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 62}
                                    strokeDashoffset={2 * Math.PI * 62 * (1 - (readiness?.score || 0) / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-extrabold text-gray-900">{readiness?.score || 0}%</span>
                                <span className="text-[10px] text-gray-450 uppercase font-bold tracking-widest mt-0.5">READY</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-gray-400 mt-6 leading-relaxed">
                            Calculated dynamically via 7 core weights (DSA, Languages, DBMS, OOP, Resume score & Consistency).
                        </p>
                    </div>

                    {/* Top Weaknesses */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100/50 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-800">Top Prep Weaknesses</h3>

                        {weakestSkills.length === 0 ? (
                            <div className="py-4 text-center text-xs text-gray-400">
                                No weakness tracked yet. Start practicing coding problems!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {weakestSkills.map((weak, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-700">{weak.skillName}</span>
                                            <span className="font-bold text-gray-500">{weak.masteryScore}% Mastery</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-400 rounded-full"
                                                style={{ width: `${weak.masteryScore}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
