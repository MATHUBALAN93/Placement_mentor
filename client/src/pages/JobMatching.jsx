import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Target, Sparkles, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const JobMatching = () => {
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [jobDescription, setJobDescription] = useState('');

    const [loading, setLoading] = useState(true);
    const [matching, setMatching] = useState(false);
    const [matchResult, setMatchResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchResumesList();
    }, []);

    const fetchResumesList = async () => {
        try {
            const res = await api.get('/resumes');
            setResumes(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedResumeId(res.data.data[0]._id);
            }
            setLoading(false);
        } catch (err) {
            setErrorMessage('Failed to load resume profiles. Please upload a resume first.');
            setLoading(false);
        }
    };

    const handleMatchSubmit = async (e) => {
        e.preventDefault();
        if (!selectedResumeId) {
            setErrorMessage('Please select a resume profile first');
            return;
        }
        if (!jobDescription || jobDescription.trim().length < 20) {
            setErrorMessage('Please paste a substantial job description first');
            return;
        }

        setMatching(true);
        setErrorMessage('');
        setMatchResult(null);

        try {
            const res = await api.post('/jobs/analyze', {
                resumeId: selectedResumeId,
                jobDescription
            });
            setMatchResult(res.data.data);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Comparison failed. Verify credentials / API keys.');
        } finally {
            setMatching(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 animate-fadeIn">

            {/* Left Column: Job Description & Resume Select (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100/50 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-901">Semantic Job Matcher</h2>
                        <p className="text-xs text-gray-400 mt-1">Audit your resume compatibility against dynamic job vacancies.</p>
                    </div>

                    <form onSubmit={handleMatchSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Select Resume Profile</label>
                            {resumes.length === 0 ? (
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-750 font-medium">
                                    No resumes found. Go to <a href="/resume" className="underline font-bold text-yellow-800">Resume Reviewer</a> to upload one first.
                                </div>
                            ) : (
                                <select
                                    value={selectedResumeId}
                                    onChange={(e) => setSelectedResumeId(e.target.value)}
                                    className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none bg-white transition"
                                >
                                    {resumes.map(r => (
                                        <option key={r._id} value={r._id}>{r.fileName} (Score: {r.evaluation.overallScore}%)</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1">Paste Job Description Specs</label>
                            <textarea
                                rows="10"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="block w-full rounded-2xl border border-gray-150 p-4 text-xs placeholder-gray-400 focus:border-purple-500 focus:outline-none transition bg-gray-50/50"
                                placeholder={`Paste responsibility lists, qualifications, software languages requirements directly here...\n\nExample:\n- 3+ years experience with React & Node.js\n- Knowledge of MongoDB, APIs, Docker...`}
                            />
                        </div>

                        {errorMessage && (
                            <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-650 border border-red-205">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={matching || !selectedResumeId}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 px-6 py-3.5 text-sm font-semibold text-white transition shadow-lg shadow-purple-50"
                        >
                            <Target className="h-4 w-4" />
                            {matching ? 'Calculating Semantic Gap...' : 'Scan Job Description Match'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Column: Comparison results (6 cols) */}
            <div className="lg:col-span-6">
                {!matchResult ? (
                    <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full min-h-[400px]">
                        <Target className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-base font-bold text-gray-800">Scanners Unassembled</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                            Paste the vacancy details and hit scan to compute semantic compatibility margins.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100/50 shadow-sm space-y-6 animate-scaleUp">

                        {/* Score Ring Summary */}
                        <div className="text-center pb-6 border-b border-gray-100">
                            <div className="inline-flex items-center justify-center h-28 w-28 rounded-full border-8 border-purple-50 bg-purple-50/30 mb-4">
                                <span className="text-3xl font-extrabold text-purple-700">{matchResult.matchScore}%</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-901">Semantic Match Ratio</h3>
                            <p className="text-xs text-gray-400 mt-1">Based on key phrases, stack alignment and experience requirements.</p>
                        </div>

                        {/* Keyword badges grids */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1 text-emerald-600">
                                    <CheckCircle className="h-4 w-4" />
                                    Keywords Found
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {matchResult.matchingSkills?.map((tag, idx) => (
                                        <span key={idx} className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100">
                                            {tag}
                                        </span>
                                    ))}
                                    {(!matchResult.matchingSkills || matchResult.matchingSkills.length === 0) && (
                                        <span className="text-xs text-gray-400">None detected.</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1 text-amber-600">
                                    <AlertCircle className="h-4 w-4" />
                                    Missing Keywords Gap
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {matchResult.missingSkills?.map((tag, idx) => (
                                        <span key={idx} className="bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-100">
                                            {tag}
                                        </span>
                                    ))}
                                    {(!matchResult.missingSkills || matchResult.missingSkills.length === 0) && (
                                        <span className="text-xs text-gray-400">None detected.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Structured feedback tips */}
                        <div className="pt-6 border-t border-gray-100 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Job Fit Recommendations</h4>
                            <div className="space-y-2">
                                {matchResult.resumeImprovementSuggestions?.map((tip, idx) => (
                                    <p key={idx} className="text-xs text-gray-650 leading-relaxed bg-purple-50/50 border border-purple-100 p-4 rounded-2xl text-purple-900">
                                        {tip}
                                    </p>
                                ))}
                                {(!matchResult.resumeImprovementSuggestions || matchResult.resumeImprovementSuggestions.length === 0) && (
                                    <p className="text-xs text-gray-650 leading-relaxed bg-purple-50/50 border border-purple-100 p-4 rounded-2xl text-purple-900">
                                        Optimize bullet points referencing required missing tools to improve score bounds.
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
};

export default JobMatching;
