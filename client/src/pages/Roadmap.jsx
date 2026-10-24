import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Map, CheckCircle2, Lock, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';

const Roadmap = () => {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorDetails, setErrorDetails] = useState('');
    const [resetting, setResetting] = useState(false);

    const [targetRole, setTargetRole] = useState('SDE');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchRoadmapData();
    }, []);

    const fetchRoadmapData = async () => {
        try {
            const res = await api.get('/roadmap');
            setRoadmap(res.data.data);
            setLoading(false);
        } catch (err) {
            setErrorDetails(err.response?.data?.message || 'Failed to fetch preparation roadmap');
            setLoading(false);
        }
    };

    const handleResetRoadmap = () => {
        if (window.confirm('Are you sure you want to reset your roadmap? You can choose a new Target Role.')) {
            setRoadmap(null);
        }
    };

    const handleGenerateRoadmap = async () => {
        setGenerating(true);
        setErrorDetails('');
        try {
            const res = await api.post('/roadmap/generate', { targetRole });
            setRoadmap(res.data.data);
        } catch (err) {
            setErrorDetails('Failed to generate roadmap');
        } finally {
            setGenerating(false);
        }
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
                    <p className="font-bold">Error loading roadmap</p>
                    <p className="text-xs text-red-550 mt-1">{errorDetails}</p>
                </div>
            </div>
        );
    }

    if (!roadmap && !loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 pb-12 animate-fadeIn mt-10">
                <div className="bg-white p-8 rounded-3xl border border-gray-100/50 shadow-sm">
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                        <Map className="h-6 w-6 text-purple-600" />
                        Generate Your Placement Roadmap
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">Select your target career path to receive a customized skill progression roadmap.</p>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Role</label>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none bg-white transition"
                                disabled={generating}
                            >
                                <option value="SDE">Software Development Engineer (SDE)</option>
                                <option value="Frontend">Frontend Engineer</option>
                                <option value="Backend">Backend Engineer</option>
                                <option value="DataScience">Data Scientist</option>
                                <option value="Security">Security Analyst</option>
                            </select>
                        </div>
                        <button
                            onClick={handleGenerateRoadmap}
                            disabled={generating}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 px-6 py-3 text-sm font-bold text-white transition shadow-lg shadow-purple-100 mt-4"
                        >
                            {generating ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <PlayCircle className="h-4 w-4" />
                            )}
                            {generating ? 'Generating...' : 'Launch Roadmap'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fadeIn">
            {/* Header and Reset Action */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-905 flex items-center gap-2">
                        <Map className="h-6 w-6 text-purple-600" />
                        Your Placement Roadmap
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Complete designated topic skills to unlock next milestones phase adaptive lists.
                    </p>
                </div>

                <button
                    onClick={handleResetRoadmap}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-250 bg-white hover:bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 transition"
                >
                    <RefreshCw className="h-3 w-3" />
                    Reset Roadmap
                </button>
            </div>

            {/* Path Roadmap */}
            {!roadmap.phases || roadmap.phases.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm">
                    <PlayCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base font-bold text-gray-800">No roadmap stages configuration generated</h3>
                </div>
            ) : (
                <div className="relative border-l border-purple-100 ml-4 pl-8 space-y-12 py-2">
                    {roadmap.phases.map((phase, pIdx) => {
                        const isInProgress = phase.status === 'In Progress';
                        const isCompleted = phase.status === 'Completed';
                        const isLocked = phase.status === 'Locked';

                        return (
                            <div key={phase._id || pIdx} className="relative">
                                {/* Node Milestone Dot Indicator */}
                                <div className={`absolute -left-[45px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : isInProgress ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-4.5 w-4.5" />
                                    ) : isLocked ? (
                                        <Lock className="h-3.5 w-3.5" />
                                    ) : (
                                        <span className="text-xs font-extrabold">{pIdx + 1}</span>
                                    )}
                                </div>

                                {/* Phase Body */}
                                <div className={`rounded-3xl border p-6 bg-white transition ${isInProgress ? 'border-purple-600 shadow-xl shadow-purple-50/50' : 'border-gray-105 shadow-sm'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-base font-extrabold text-gray-901">{phase.name}</h3>
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">Phase {pIdx + 1}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isCompleted ? 'bg-emerald-50 text-emerald-700' : isInProgress ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                                            {phase.status}
                                        </span>
                                    </div>

                                    {/* Skills Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {phase.skills.map((skill, sIdx) => {
                                            return (
                                                <div
                                                    key={skill.skillId || sIdx}
                                                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold ${skill.isCompleted ? 'bg-emerald-50/20 border-emerald-100 text-emerald-900' : 'bg-gray-50/50 border-gray-100 text-gray-700'}`}
                                                >
                                                    <span className="truncate">{skill.name}</span>
                                                    {skill.isCompleted ? (
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase font-bold shrink-0">Mastered</span>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 font-bold shrink-0">Needs {skill.masteryRequired}% Mastery</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Roadmap;
